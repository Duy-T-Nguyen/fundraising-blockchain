import { useState, useEffect, useCallback, useRef } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { formatEther, getAddress } from 'viem';
import { useMetadata } from './useMetadata';

export interface UserDonation {
  campaignAddress: string;
  campaignName: string;
  amount: string;
  timestamp: string;
}

export interface ManagedCampaign {
  address: string;
  name: string;
  balance: string;
  active: boolean;
  imageHash: string;
}

export function useUserActivity(userAddress: `0x${string}` | undefined) {
  const [managedCampaigns, setManagedCampaigns] = useState<ManagedCampaign[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [userDonations, setUserDonations] = useState<UserDonation[]>([]);
  const [managedDonations, setManagedDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getCampaignName, getBlockTimestamp } = useMetadata();
  const isFetching = useRef(false);

  const fetchActivity = useCallback(async () => {
    if (!userAddress || isFetching.current) return;

    const checksumAddress = getAddress(userAddress);
    const cacheKey = `donations_${checksumAddress}`;

    // Quick load from storage
    const cached = localStorage.getItem(cacheKey);
    if (cached) setUserDonations(JSON.parse(cached));

    setIsLoading(true);
    isFetching.current = true;

    try {
      // 1. Fetch available campaigns list (latest 100)
      const allCampaignAddresses = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY as any,
        functionName: 'getCampaigns',
        args: [0, '0x0000000000000000000000000000000000000000', 0, 0n, 100n],
      } as any) as `0x${string}`[];

      // 3. Robust client-side filtering (ignores case sensitivity issues)
      const managers = await publicClient.multicall({
        contracts: allCampaignAddresses.map(addr => ({
          address: addr,
          abi: ABIS.CAMPAIGN,
          functionName: 'manager'
        })) as any,
      });
      
      const managedAddresses = allCampaignAddresses.filter((addr, i) => 
        managers[i].status === 'success' && 
        (String(managers[i].result)).toLowerCase() === checksumAddress.toLowerCase()
      );

      // Fetch pending requests
      const requestsData = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY as any,
        functionName: 'getCampaignRequests',
        args: [0n, 100n],
      } as any) as [any[], bigint];

      const userPending = requestsData[0]
        .filter(r => r.manager.toLowerCase() === checksumAddress.toLowerCase() && Number(r.status) === 0)
        .map((r, i) => ({
          id: i,
          manager: r.manager,
          metadataCID: r.metadataCID,
          category: r.category,
          status: 'PENDING'
        }));

      // Fetch metadata for pending requests
      const formattedPending = await Promise.all(userPending.map(async (req) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evidence/metadata?cid=${req.metadataCID}`);
          if (!res.ok) return req;
          const metadata = await res.json();
          return { ...req, name: metadata.name, description: metadata.description, image: metadata.image };
        } catch { return req; }
      }));

      setPendingRequests(formattedPending);

      if (managedAddresses.length > 0) {
        const multicallContracts = managedAddresses.flatMap(addr => [
          { address: addr, abi: ABIS.CAMPAIGN, functionName: 'getSummary' }
        ]);

        const results = await publicClient.multicall({
          contracts: multicallContracts as any,
        });

        const managedData: ManagedCampaign[] = [];
        for (let i = 0; i < managedAddresses.length; i++) {
          const summaryResult = results[i];

          if (summaryResult.status === 'success') {
            const summary = summaryResult.result as any[];
            // SYNC WITH HOME/CAMPAIGNS PAGE LOGIC:
            // summary[0]: balance, summary[7]: name, summary[9]: imageHash, summary[10]: active
            managedData.push({
              address: managedAddresses[i],
              name: summary[7] || 'Unnamed Project',
              balance: formatEther(summary[0]),
              active: summary[10],
              imageHash: summary[9]
            });
          }
        }
        setManagedCampaigns(managedData);
      }

      // 3. RAPID MODE: Scan last ~1 day for instant results
      if (allCampaignAddresses.length === 0) {
        setIsLoading(false);
        isFetching.current = false;
        return;
      }

      const currentBlock = await publicClient.getBlockNumber();
      const LOOKBACK = 50000n;
      const scanLimit = currentBlock - LOOKBACK;
      const CHUNK_SIZE = 50000n;

      const allLogs: any[] = [];
      const chunks: { from: bigint, to: bigint }[] = [];
      for (let from = scanLimit; from < currentBlock; from += CHUNK_SIZE) {
        let to = from + CHUNK_SIZE - 1n;
        if (to > currentBlock) to = currentBlock;
        chunks.push({ from, to });
      }

      // Process logs in larger parallel batches
      for (let i = chunks.length - 1; i >= 0; i -= 5) {
        const batch = chunks.slice(Math.max(0, i - 4), i + 1);
        try {
          const [userBatch, managedBatch] = await Promise.all([
            publicClient.getLogs({
              address: allCampaignAddresses,
              event: {
                type: 'event',
                name: 'Donation',
                inputs: ABIS.CAMPAIGN.find((x: any) => x.name === 'Donation')?.inputs || [],
              },
              args: { donor: checksumAddress } as any,
              fromBlock: chunk.from,
              toBlock: chunk.to
            }),
            managedAddresses.length > 0 ? publicClient.getLogs({
              address: managedAddresses,
              event: {
                type: 'event',
                name: 'Donation',
                inputs: ABIS.CAMPAIGN.find((x: any) => x.name === 'Donation')?.inputs || [],
              },
              fromBlock: chunk.from,
              toBlock: chunk.to
            }) : Promise.resolve([])
          ]);

          allLogs.push(...userBatch.flat());
          
          if (managedBatch.length > 0) {
            const resolvedManaged = await resolveLogNames(managedBatch);
            setManagedDonations(prev => [...prev, ...resolvedManaged]);
          }

          if (allLogs.length > 0) {
            const partialDonations = await resolveLogNames(allLogs);
            setUserDonations(partialDonations);
          }
        } catch (e) {
          console.warn('Batch logs query failed', e);
        }
      }

      const finalDonations = await resolveLogNames(allLogs);
      setUserDonations(finalDonations);
      localStorage.setItem(cacheKey, JSON.stringify(finalDonations));

    } catch (err) {
      console.error('User Activity Sync Error:', err);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [userAddress, getCampaignName, getBlockTimestamp]);

  async function resolveLogNames(logs: any[]): Promise<UserDonation[]> {
    // Process unique requests only
    const resolvedLogs = await Promise.all(logs.map(async (log) => {
      const [name, date] = await Promise.all([
        getCampaignName(log.address as `0x${string}`),
        getBlockTimestamp(log.blockNumber)
      ]);

      return {
        campaignAddress: log.address,
        campaignName: name,
        amount: formatEther(log.args.amount),
        timestamp: date,
      };
    }));

    return resolvedLogs.reverse();
  }

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { managedCampaigns, pendingRequests, userDonations, managedDonations, isLoading, refresh: fetchActivity };
}
