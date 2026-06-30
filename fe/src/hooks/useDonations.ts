import { useState, useEffect, useCallback } from 'react';
import { formatEther } from 'viem';
import { publicClient } from '../blockchain/client';
import { ABIS } from '../blockchain/constants';

export interface Donation {
  id: string;
  donor: string;
  amount: string;
  timestamp: string;
  blockNumber: bigint;
  logIndex: number;
}

export function useDonations(address: string | undefined) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDonations = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      const currentBlock = await publicClient.getBlockNumber();
      const START_BLOCK = 6000000n; // Safe start block for the project on Sepolia
      const CHUNK_SIZE = 50000n; // Max logs range for free public nodes
      
      const chunks: { from: bigint; to: bigint }[] = [];
      for (let from = START_BLOCK; from < currentBlock; from += CHUNK_SIZE) {
        let to = from + CHUNK_SIZE - 1n;
        if (to > currentBlock) to = currentBlock;
        chunks.push({ from, to });
      }

      // Fetch all chunks in parallel (last 20 chunks to avoid overloading)
      const visibleChunks = chunks.slice(-20); 

      const allLogs = await Promise.all(
        visibleChunks.map(chunk => 
          publicClient.getContractEvents({
            address: address as `0x${string}`,
            abi: ABIS.CAMPAIGN,
            eventName: 'Donation',
            fromBlock: chunk.from,
            toBlock: chunk.to,
          })
        )
      );

      const flattenedLogs = allLogs.flat();

      // Transform logs into Donation objects
      const formattedDonations = await Promise.all(
        flattenedLogs.map(async (log: any) => {
          const { donor, amount } = log.args;
          
          let date = 'Recent';
          try {
            const block = await publicClient.getBlock({ blockHash: log.blockHash });
            date = new Date(Number(block.timestamp) * 1000).toLocaleString();
          } catch (e) {
            console.warn('Could not fetch block timestamp', e);
          }

          return {
            id: `${log.transactionHash}-${log.logIndex}`,
            donor: donor as string,
            amount: formatEther(amount),
            timestamp: date,
            blockNumber: log.blockNumber,
            logIndex: log.logIndex,
          };
        })
      );

      // Sort by blockNumber (desc) then logIndex (desc) for perfect temporal ordering
      const sorted = formattedDonations.sort((a, b) => {
        if (b.blockNumber !== a.blockNumber) {
          return b.blockNumber > a.blockNumber ? 1 : -1;
        }
        return b.logIndex - a.logIndex;
      });

      setDonations(sorted);
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  return { donations, isLoading, refresh: fetchDonations };
}
