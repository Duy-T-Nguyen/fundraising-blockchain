import { useState, useEffect, useCallback } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { formatEther } from 'viem';
import type { VerifierTask, VerifierStats } from '../types/verifier';

export const useVerifierTasks = (address: `0x${string}` | undefined) => {
  const [tasks, setTasks] = useState<VerifierTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<VerifierStats>({
    totalTasks: 0,
    pendingExpert: 0,
    pendingCommunity: 0,
    completedCount: 0
  });

  const fetchTasks = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      // 1. Lấy tất cả Campaign từ Factory
      const campaignCount = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY,
        functionName: 'getCampaignsCount',
      }) as bigint;

      const campaignAddresses = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY,
        functionName: 'getCampaigns',
        args: [0, address, 0, 0, Number(campaignCount)] // Type ALL = 0
      }) as `0x${string}`[];

      const allTasks: VerifierTask[] = [];

      // 2. Duyệt qua từng campaign để tìm request
      for (const campaignAddr of campaignAddresses) {
        const [,,numRequests,,name] = await publicClient.readContract({
          address: campaignAddr,
          abi: ABIS.CAMPAIGN,
          functionName: 'getSummary'
        }) as any[];

        const count = Number(numRequests);
        
        for (let i = 0; i < count; i++) {
          const request = await publicClient.readContract({
            address: campaignAddr,
            abi: ABIS.CAMPAIGN,
            functionName: 'requests',
            args: [BigInt(i)]
          }) as any;

          // request structure: [desc, value, recipient, complete, weight, donorCount, verifier, hash, type, currentMilestone, totalFunds, donorCountSnapshot, validatorApprovalCount]
          // Note: index for 'verifier' is 6, 'complete' is 3, 'type' is 8
          
          const verifierAddr = request[6];
          const isComplete = request[3];
          const requestType = request[8]; // 0: SINGLE, 1: MULTI
          const selectedValidators = await publicClient.readContract({
            address: campaignAddr,
            abi: ABIS.CAMPAIGN,
            functionName: 'getSelectedValidators',
            args: [BigInt(i)]
          }) as `0x${string}`[];

          const isExpert = verifierAddr.toLowerCase() === address.toLowerCase();
          const isValidator = selectedValidators.some(v => v.toLowerCase() === address.toLowerCase());

          if (isExpert || isValidator) {
            allTasks.push({
              id: `${campaignAddr}-${i}`,
              campaignAddress: campaignAddr,
              campaignName: name,
              requestIndex: i,
              description: request[0],
              value: formatEther(request[1]),
              recipient: request[2],
              evidenceHash: request[7],
              type: isExpert ? 'EXPERT_SIGNATURE' : 'COMMUNITY_VOTE',
              status: isComplete ? 'COMPLETED' : 'PENDING',
              isMultiStage: requestType === 1,
              milestoneIndex: requestType === 1 ? Number(request[9]) : undefined
            });
          }
        }
      }

      setTasks(allTasks);
      
      // Calculate Stats
      const pendingExpert = allTasks.filter(t => t.type === 'EXPERT_SIGNATURE' && t.status === 'PENDING').length;
      const pendingCommunity = allTasks.filter(t => t.type === 'COMMUNITY_VOTE' && t.status === 'PENDING').length;
      const completedCount = allTasks.filter(t => t.status === 'COMPLETED').length;

      setStats({
        totalTasks: allTasks.length,
        pendingExpert,
        pendingCommunity,
        completedCount
      });

    } catch (error) {
      console.error('Failed to fetch verifier tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, isLoading, stats, refresh: fetchTasks };
};
