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
  createdBlock: bigint; // Added to track creation time
}

export function useRequests(address: string | undefined) {
  const [requests, setRequests] = useState<CampaignRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      // 1. Fetch RequestCreated logs to get block numbers
      const logs = await publicClient.getLogs({
        address: address as `0x${string}`,
        event: {
          type: 'event',
          name: 'RequestCreated',
          inputs: [
            { type: 'uint256', name: 'id', indexed: true },
            { type: 'string', name: 'description', indexed: false },
            { type: 'uint256', name: 'value', indexed: false },
            { type: 'address', name: 'recipient', indexed: false },
            { type: 'address', name: 'verifier', indexed: false },
            { type: 'string', name: 'evidenceHash', indexed: false },
            { type: 'address[]', name: 'selectedValidators', indexed: false },
            { type: 'uint256', name: 'lastValidatorSelection', indexed: false }
          ],
        },
        fromBlock: BigInt(Math.max(0, Number(await publicClient.getBlockNumber()) - 40000)), 
      });

      // Map request ID to block number
      const blockMap = new Map<number, bigint>();
      logs.forEach(log => {
        if (log.args.id !== undefined) {
          blockMap.set(Number(log.args.id), log.blockNumber);
        }
      });

      // 2. Get total number of requests
      const summary = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: ABIS.CAMPAIGN as any,
        functionName: 'getSummary',
      } as any) as any[];

      const numRequests = Number(summary[2]);
      
      // 3. Fetch each request detail
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
            approvalWeights: req[4].toString(),
            evidenceHash: req[5],
            requestType: req[6],
            createdBlock: blockMap.get(i) || 0n,
          };
        })
      );

      setRequests(requestsData.reverse());
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
