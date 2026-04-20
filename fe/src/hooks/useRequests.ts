import { useState, useEffect, useCallback } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS } from '../blockchain/constants';
import { formatEther } from 'viem';

export type CampaignRequest = {
  id: number;
  description: string;
  value: string;
  recipient: string;
  complete: boolean;
  approvalWeights: string;
  evidenceHash: string;
  requestType: number;
  approvalsCount?: number;
}

export function useRequests(address: string | undefined) {
  const [requests, setRequests] = useState<CampaignRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      // 1. Get total number of requests
      const summary = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: ABIS.CAMPAIGN as any,
        functionName: 'getSummary',
      } as any) as any[];

      const numRequests = Number(summary[2]);
      // 2. Fetch each request detail
      const requestsData = await Promise.all(
        Array.from({ length: numRequests }).map(async (_, i) => {
          const req = await publicClient.readContract({
            address: address as `0x${string}`,
            abi: ABIS.CAMPAIGN as any,
            functionName: 'requests',
            args: [BigInt(i)],
          } as any) as any[];

          return {
            id: i,
            description: req[0],
            value: formatEther(req[1]),
            recipient: req[2],
            complete: req[3],
            approvalWeights: req[4].toString(), // For weight-based voting
            evidenceHash: req[5],
            requestType: req[6],
          };
        })
      );

      setRequests(requestsData.reverse()); // Latest requests first
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, isLoading, refresh: fetchRequests };
}
