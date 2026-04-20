import { useState, useEffect, useCallback } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { formatEther, getAddress } from 'viem';

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
}

export function useUserActivity(userAddress: `0x${string}` | undefined) {
  const [managedCampaigns, setManagedCampaigns] = useState<ManagedCampaign[]>([]);
  const [userDonations, setUserDonations] = useState<UserDonation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivity = useCallback(async () => {
    if (!userAddress) return;
    const checksumAddress = getAddress(userAddress);
    const cacheKey = `donations_${checksumAddress}`;
    
    const cached = localStorage.getItem(cacheKey);
    if (cached) setUserDonations(JSON.parse(cached));

    setIsLoading(true);

    try {
      // 1. Fetch available campaigns from factory to scan (e.g., latest 50)
      const allCampaignAddresses = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY as any,
        functionName: 'getCampaigns',
        args: [0, '0x0000000000000000000000000000000000000000', 0, 0n, 50n],
      } as any) as `0x${string}`[];

      // 2. Filter for managed ones (fast)
      const managedAddresses = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY as any,
        functionName: 'getCampaigns',
        args: [1, checksumAddress, 0, 0n, 20n],
      } as any) as `0x${string}`[];

      const managedData = await Promise.all(
        managedAddresses.map(async (addr) => {
          try {
            const [summary, name] = await Promise.all([
              publicClient.readContract({ address: addr, abi: ABIS.CAMPAIGN as any, functionName: 'getSummary' } as any),
              publicClient.readContract({ address: addr, abi: ABIS.CAMPAIGN as any, functionName: 'campaignName' } as any)
            ]) as [any[], string];
            return { address: addr, name, balance: formatEther(summary[0]), active: summary[6] };
          } catch { return null; }
        })
      );
      setManagedCampaigns(managedData.filter(Boolean) as ManagedCampaign[]);

      // 3. TARGETED MULTI-ADDRESS SCAN (Satisfies RPC address requirement)
      const currentBlock = await publicClient.getBlockNumber();
      const START_BLOCK = 6000000n; 
      const CHUNK_SIZE = 45000n;
      
      const allLogs: any[] = [];
      const scanLimit = currentBlock - 2000000n > START_BLOCK ? currentBlock - 2000000n : START_BLOCK;

      const chunks: {from: bigint, to: bigint}[] = [];
      for (let from = scanLimit; from < currentBlock; from += CHUNK_SIZE) {
        let to = from + CHUNK_SIZE - 1n;
        if (to > currentBlock) to = currentBlock;
        chunks.push({ from, to });
      }

      // Process in small batches of parallel requests
      const batchSizeArr = 3; 
      for (let i = chunks.length - 1; i >= 0; i -= batchSizeArr) {
        const batch = chunks.slice(Math.max(0, i - batchSizeArr + 1), i + 1);
        
        try {
          const batchResults = await Promise.all(
            batch.map(chunk => 
              publicClient.getLogs({
                address: allCampaignAddresses, // PROVIDING ARRAY OF ADDRESSES TO SATISFY RPC
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
          console.warn('Batch scan failed', e);
        }
      }

      const finalDonations = await resolveLogNames(allLogs);
      setUserDonations(finalDonations);
      localStorage.setItem(cacheKey, JSON.stringify(finalDonations));

    } catch (err) {
      console.error('User Activity Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  // Optimized Helper to resolve names
  async function resolveLogNames(logs: any[]): Promise<UserDonation[]> {
    return Promise.all(logs.map(async (log) => {
      const campaignAddr = log.address;
      try {
        const [name, block] = await Promise.all([
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: ABIS.CAMPAIGN as any,
            functionName: 'campaignName',
          } as any),
          publicClient.getBlock({ blockNumber: log.blockNumber })
        ]);

        const date = new Date(Number(block.timestamp) * 1000).toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return {
          campaignAddress: campaignAddr,
          campaignName: name as string,
          amount: formatEther(log.args.amount),
          timestamp: date,
        };
      } catch {
        return {
          campaignAddress: campaignAddr,
          campaignName: 'Campaign',
          amount: formatEther(log.args.amount),
          timestamp: 'Recent',
        };
      }
    })).then(results => results.reverse());
  }

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { managedCampaigns, userDonations, isLoading, refresh: fetchActivity };
}
