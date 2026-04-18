import { useState, useEffect, useCallback } from 'react';
import { formatEther } from 'viem';
import { publicClient } from '../blockchain/client';
import { ABIS } from '../blockchain/constants';

export interface Donation {
  id: string;
  donor: string;
  amount: string;
  timestamp: string;
}

export function useDonations(address: string | undefined) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDonations = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      // Get current block to calculate a safe range
      const currentBlock = await publicClient.getBlockNumber();
      const safeFromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n;

      // Get Donation events from the contract
      const logs = await publicClient.getContractEvents({
        address: address as `0x${string}`,
        abi: ABIS.CAMPAIGN,
        eventName: 'Donation',
        fromBlock: safeFromBlock,
      });

      // Transform logs into Donation objects
      const formattedDonations = await Promise.all(
        logs.map(async (log: any, index: number) => {
          const { donor, amount } = log.args;
          
          // Try to get block timestamp (optional, can fallback to log index)
          let date = 'Recent';
          try {
            const block = await publicClient.getBlock({ blockHash: log.blockHash });
            date = new Date(Number(block.timestamp) * 1000).toLocaleString();
          } catch (e) {
            console.warn('Could not fetch block timestamp', e);
          }

          return {
            id: `${log.transactionHash}-${index}`,
            donor: donor as string,
            amount: formatEther(amount),
            timestamp: date,
          };
        })
      );

      // Sort by latest first
      setDonations(formattedDonations.reverse());
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
