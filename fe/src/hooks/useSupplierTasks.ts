import { useState, useEffect, useCallback } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { formatEther } from 'viem';
import { fetchIPFSJSON } from '../utils/ipfs';
import type { SupplierTask } from '../types/supplier';

export function useSupplierTasks(userAddress?: string) {
  const [tasks, setTasks] = useState<SupplierTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!userAddress) return;
    setIsLoading(true);

    try {
      console.log('DEBUG: Starting task fetch for address:', userAddress);
      
      // 1. Get ALL campaigns from Factory
      const count = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY,
        functionName: 'getCampaignsCount',
      }) as bigint;
      console.log('DEBUG: Total campaigns in factory:', Number(count));

      const campaigns = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY,
        functionName: 'getCampaigns',
        args: [0, '0x0000000000000000000000000000000000000000', 0, 0n, count],
      }) as `0x${string}`[];
      console.log('DEBUG: Campaign addresses found:', campaigns);

      if (!campaigns || campaigns.length === 0) {
        console.log('DEBUG: No campaigns found in factory.');
        setTasks([]);
        return;
      }

      const allFoundTasks: SupplierTask[] = [];

      for (const campaignAddr of campaigns) {
        try {
          // Use getSummary which is already in the ABI to get numRequests
          const summary = await publicClient.readContract({
            address: campaignAddr,
            abi: ABIS.CAMPAIGN,
            functionName: 'getSummary',
          }) as any[];
          
          const reqCount = summary[2]; // numRequests is the 3rd element (index 2)
          console.log(`DEBUG: Campaign ${campaignAddr} has ${reqCount} requests (via summary).`);

          const requestPromises = [];
          for (let i = 0; i < Number(reqCount); i++) {
            requestPromises.push(
              publicClient.readContract({
                address: campaignAddr,
                abi: ABIS.CAMPAIGN,
                functionName: 'requests',
                args: [BigInt(i)],
              })
            );
          }

          const results = await Promise.all(requestPromises);
          
          const taskResults = await Promise.all(results.map(async (data: any, idx) => {
            const recipient = data[11]; // recipient is at index 11
            const isCompleted = Number(data[13]) === 1; // status is at index 13 (1 = COMPLETED)
            
            if (recipient && recipient.toLowerCase() === userAddress.toLowerCase()) {
              // Check if governance (voting) phase has been passed
              const validatorApprovalCount = Number(data[7] || 0);
              const totalApprovalWeight = BigInt(data[4] || 0n);
              const snapshotTotalFunds = BigInt(data[5] || 0n);

              const validatorApproved = validatorApprovalCount >= 2;
              const communityApproved = snapshotTotalFunds > 0n && totalApprovalWeight > snapshotTotalFunds / 2n;
              const isGovernanceApproved = validatorApproved || communityApproved;

              // Only show in Delivery Queue if voting has passed AND not yet finalized
              if (!isGovernanceApproved && !isCompleted) {
                return null; // Still in voting phase — hide from supplier
              }

              const rawCID = data[0] as string;
              let description = `Request #${idx}`; // safe fallback — never show raw CID
              let managerEvidenceCID = ''; // Manager's attached document (initial notice)
              
              try {
                const metadata = await fetchIPFSJSON(rawCID);
                if (metadata) {
                  if (metadata.title) {
                    description = metadata.title;
                  } else if (metadata.name) {
                    description = metadata.name;
                  } else if (metadata.description) {
                    description = metadata.description.split('\n')[0].slice(0, 80);
                  }
                  // Extract manager's initial notice document
                  if (metadata.evidence) {
                    managerEvidenceCID = metadata.evidence.replace('ipfs://', '');
                  }
                }
              } catch (e) {
                console.warn(`[SupplierTasks] Metadata fetch failed for req ${idx}:`, e);
              }

              return {
                campaignAddress: campaignAddr,
                requestId: idx,
                description,
                value: formatEther(data[3] || 0n),
                complete: isCompleted,
                evidenceHash: managerEvidenceCID, // Manager's initial notice doc
              } as SupplierTask;
            }
            return null;
          }));

          taskResults.forEach(task => {
            if (task) allFoundTasks.push(task);
          });
        } catch (err) {
          console.error(`DEBUG: Error scanning campaign ${campaignAddr}:`, err);
        }
      }

      console.log('DEBUG: Final synchronized task list:', allFoundTasks);
      setTasks(allFoundTasks.reverse());
    } catch (err) {
      console.error('Error fetching supplier tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, isLoading, refresh: fetchTasks };
}
