import { useState, useEffect, useCallback } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { formatEther } from 'viem';
import type { VerifierTask, VerifierStats } from '../types/verifier';
import { fetchIPFSJSON } from '../utils/ipfs';

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
        // Use zero address to get ALL campaigns (not filtered by creator)
        args: [0, '0x0000000000000000000000000000000000000000', 0, 0, Number(campaignCount)]
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

          // Log raw struct for index debugging
          console.log(`[VerifierDebug] Campaign ${campaignAddr} | Req #${i} raw:`, request);

          // Correct struct indices (verified against Campaign.sol):
          // [0]=metadataCID, [1]=proofCID, [2]=rejectionReasonCID,
          // [3]=value, [4]=totalApprovalWeight, [5]=snapshotTotalFunds,
          // [6]=snapshotDonorCount, [7]=validatorApprovalCount,
          // [8]=lastValidatorSelection, [9]=currentMilestone, [10]=createdAt,
          // [11]=recipient, [12]=requestType, [13]=status, [14]=verifyStatus, [15]=verifier
          
          const verifierAddr  = (request[15] as string) || '';
          const proofCID      = (request[1] as string)  || '';
          const isVerified    = !!request[14];
          const requestType   = Number(request[12]);

          console.log(`[VerifierDebug] Req #${i}: verifierAddr=${verifierAddr} | myAddress=${address} | match=${verifierAddr.toLowerCase() === address.toLowerCase()} | proofCID=${proofCID || '(empty)'}`);

          // ✅ STRICT FILTER: Only show if this wallet IS the designated verifier
          const isExpert = verifierAddr.toLowerCase() === address.toLowerCase();

          if (!isExpert) {
            console.log(`[VerifierDebug] Req #${i} → SKIP: not the designated verifier`);
            continue;
          }

          // ✅ Only show to verifier after supplier has submitted proof
          if (!proofCID) {
            console.log(`[VerifierDebug] Req #${i} → SKIP: verifier matched but no proof yet`);
            continue;
          }

          console.log(`[VerifierDebug] Req #${i} → SHOW to verifier ✅`);

          // Resolve metadataCID → human-readable title
          const rawCID = request[0] as string;
          let description = `Request #${i}`;
          try {
            const metadata = await fetchIPFSJSON(rawCID);
            if (metadata?.title) description = metadata.title;
            else if (metadata?.name) description = metadata.name;
            else if (metadata?.description) description = metadata.description.split('\n')[0].slice(0, 80);
          } catch { /* keep fallback */ }

          allTasks.push({
            id: `${campaignAddr}-${i}`,
            campaignAddress: campaignAddr,
            campaignName: name,
            requestIndex: i,
            description,
            value: formatEther(request[3]),
            recipient: request[11],
            evidenceHash: proofCID,
            type: 'EXPERT_SIGNATURE',
            status: isVerified ? 'COMPLETED' : 'PENDING',
            isMultiStage: requestType === 1,
            milestoneIndex: requestType === 1 ? Number(request[9]) : undefined
          });
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
