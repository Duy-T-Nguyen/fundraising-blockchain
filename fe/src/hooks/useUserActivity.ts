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
  const [userDonations, setUserDonations] = useState<UserDonation[]>([]);
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
      // 1. Fetch available campaigns list (latest 50)
      const allCampaignAddresses = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY as any,
        functionName: 'getCampaigns',
        args: [0, '0x0000000000000000000000000000000000000000', 0, 0n, 50n],
      } as any) as `0x${string}`[];

      // 2. Fetch managed campaigns (Optimized with Multicall)
      const managedAddresses = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY as any,
        functionName: 'getCampaigns',
        args: [1, checksumAddress, 0, 0n, 30n], 
      } as any) as `0x${string}`[];

      if (managedAddresses.length > 0) {
        const multicallContracts = managedAddresses.flatMap(addr => [
          { address: addr, abi: ABIS.CAMPAIGN, functionName: 'campaignName' },
          { address: addr, abi: ABIS.CAMPAIGN, functionName: 'getSummary' }
        ]);

        const results = await publicClient.multicall({
          contracts: multicallContracts as any,
        });

        const managedData: ManagedCampaign[] = [];
        for (let i = 0; i < managedAddresses.length; i++) {
          const name = results[i * 2].result as string;
          const summary = results[i * 2 + 1].result as any[];
          
          if (name && summary) {
            managedData.push({
              address: managedAddresses[i],
              name,
              balance: formatEther(summary[0]),
              active: summary[6],
              imageHash: summary[5]
            });
          }
        }
        setManagedCampaigns(managedData);
      }

      // 3. RAPID MODE: Scan last ~1 day for instant results
      const currentBlock = await publicClient.getBlockNumber();
      const LOOKBACK = 50000n; 
      const scanLimit = currentBlock - LOOKBACK;
      const CHUNK_SIZE = 50000n;
      
      const allLogs: any[] = [];
      const chunks: {from: bigint, to: bigint}[] = [];
      for (let from = scanLimit; from < currentBlock; from += CHUNK_SIZE) {
        let to = from + CHUNK_SIZE - 1n;
        if (to > currentBlock) to = currentBlock;
        chunks.push({ from, to });
      }

      // Process logs in larger parallel batches
      for (let i = chunks.length - 1; i >= 0; i -= 5) {
        const batch = chunks.slice(Math.max(0, i - 4), i + 1);
        try {
          const batchResults = await Promise.all(
            batch.map(chunk => 
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
              })
            )
          );
          allLogs.push(...batchResults.flat());
          
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

  return { managedCampaigns, userDonations, isLoading, refresh: fetchActivity };
}
