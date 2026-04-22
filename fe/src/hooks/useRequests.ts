import { useState, useEffect, useCallback, useRef } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS } from '../blockchain/constants';
import { formatEther } from 'viem';
import { fetchIPFSJSON } from '../utils/ipfs';

export type CampaignRequest = {
  id: number;
  description: string;
  value: string;
  recipient: string;
  complete: boolean;
  approvalWeights: string;
  evidenceHash: string;
  requestType: number;
  createdBlock: bigint;
  snapshotTotalFunds: bigint;
  snapshotDonorCount: bigint;
  voterCount: number; // Added to track number of people
}

export function useRequests(address: string | undefined, userAddress?: string) {
  const [requests, setRequests] = useState<CampaignRequest[]>([]);
  const [votedRequestIds, setVotedRequestIds] = useState<Set<number>>(new Set());
  const [pendingRequestIds, setPendingRequestIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const fetchIdRef = useRef(0);

  const fetchRequests = useCallback(async () => {
    if (!address) return;
    const currentFetchId = ++fetchIdRef.current;
    setIsLoading(true);

    try {
      // 1. Fetch logs and pending intents
      const [creationLogs, allVotingLogs, pendingIntentsRes] = await Promise.all([
        publicClient.getLogs({
          address: address as `0x${string}`,
          event: {
            type: 'event',
            name: 'RequestCreated',
            inputs: [
              { type: 'uint256', name: 'id', indexed: true },
              { type: 'string', name: 'metadataCID', indexed: false },
              { type: 'uint256', name: 'value', indexed: false },
              { type: 'address', name: 'recipient', indexed: false },
              { type: 'address', name: 'verifier', indexed: false },
              { type: 'address[]', name: 'selectedValidators', indexed: false },
              { type: 'uint256', name: 'lastValidatorSelection', indexed: false }
            ],
          },
          fromBlock: BigInt(Math.max(0, Number(await publicClient.getBlockNumber()) - 40000)), 
        }),
        // Fetch ALL Voted events to count people
        publicClient.getLogs({
          address: address as `0x${string}`,
          event: {
            type: 'event',
            name: 'Voted',
            inputs: [
              { type: 'address', name: 'voter', indexed: true },
              { type: 'uint256', name: 'requestId', indexed: true }
            ],
          },
          fromBlock: BigInt(Math.max(0, Number(await publicClient.getBlockNumber()) - 40000)),
        }),
        // Fetch pending intents from backend queue if user is logged in
        userAddress ? fetch(`${import.meta.env.VITE_API_BASE_URL}/relayer/intents/${userAddress}`) : Promise.resolve(null)
      ]);

      // Map request ID to block number
      const blockMap = new Map<number, bigint>();
      creationLogs.forEach(log => {
        if (log.args.id !== undefined) {
          blockMap.set(Number(log.args.id), log.blockNumber);
        }
      });

      // Map request ID to Voter Count and Current User Vote
      const voterCountMap = new Map<number, number>();
      const userVotes = new Set<number>();
      
      allVotingLogs.forEach(log => {
        const rId = Number(log.args.requestId);
        const voter = log.args.voter as string;
        
        // Count unique voters per request
        voterCountMap.set(rId, (voterCountMap.get(rId) || 0) + 1);
        
        // Check if current user voted
        if (userAddress && voter.toLowerCase() === userAddress.toLowerCase()) {
          userVotes.add(rId);
        }
      });
      
      // Check pending intents
      const pendingVotes = new Set<number>();
      if (pendingIntentsRes && pendingIntentsRes.ok) {
        try {
          const pendingArray = await pendingIntentsRes.json();
          if (Array.isArray(pendingArray)) {
            pendingArray.forEach(id => pendingVotes.add(id));
          }
        } catch (e) {
          console.error('Error parsing pending intents:', e);
        }
      }

      // Removed setVotedRequestIds(userVotes) from here to ensure it only updates if not stale

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

          const metaCID = req[0];
          const metadata = await fetchIPFSJSON(metaCID);

          // req[3] = snapshotTotalFunds, req[4] = snapshotDonorCount
          return {
            id: i,
            description: metadata?.description || 'No description',
            value: formatEther(req[1]),
            recipient: req[9],
            complete: Number(req[11]) === 1,
            approvalWeights: req[2].toString(),
            evidenceHash: metadata?.evidence || '',
            requestType: Number(req[10]),
            createdBlock: blockMap.get(i) || BigInt(0),
            snapshotTotalFunds: req[3] || BigInt(0),
            snapshotDonorCount: req[4] || BigInt(0),
            voterCount: voterCountMap.get(i) || 0,
          };
        })
      );

      if (currentFetchId !== fetchIdRef.current) {
        console.log(`[useRequests] Ignoring stale response for fetch ID ${currentFetchId} (Latest is ${fetchIdRef.current})`);
        return;
      }

      setVotedRequestIds(userVotes);
      setPendingRequestIds(pendingVotes);
      setRequests(requestsData.reverse());
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, userAddress]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, votedRequestIds, pendingRequestIds, isLoading, refresh: fetchRequests };
}
