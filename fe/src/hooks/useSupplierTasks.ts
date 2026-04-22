import { useState, useEffect, useCallback } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { formatEther } from 'viem';
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
          
          results.forEach((data: any, idx) => {
            const recipient = data[2]; 
            console.log(`DEBUG: Checking Req #${idx} on ${campaignAddr.slice(0,6)}:`, {
              recipientFound: recipient,
              expectedUser: userAddress,
              match: recipient?.toLowerCase() === userAddress.toLowerCase()
            });
            
            if (recipient && recipient.toLowerCase() === userAddress.toLowerCase()) {
              allFoundTasks.push({
                campaignAddress: campaignAddr,
                requestId: idx,
                description: data[0],
                value: formatEther(data[1]),
                complete: data[3],
                evidenceHash: data[5],
              });
            }
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
