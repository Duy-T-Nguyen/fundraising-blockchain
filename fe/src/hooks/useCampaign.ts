import { useState, useEffect, useCallback } from 'react';
import { formatEther } from 'viem';
import { publicClient } from '../blockchain/client';
import { ABIS } from '../blockchain/constants';
import { fetchIPFSJSON } from '../utils/ipfs';

export interface CampaignSummary {
  title: string;
  description: string;
  imageHash: string;
  balance: string;
  minimumContribution: string;
  numRequests: number;
  donorsCount: number;
  manager: string;
  active: boolean;
  userContribution: bigint;
  firstDonationBlock: bigint | null;
  availableFunds: string;
  lockedFunds: string;
}

export function useCampaign(address: string | undefined, userAddress?: string) {
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch BASIC summary info and user contribution
      const [summaryData, userContribution] = await Promise.all([
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: ABIS.CAMPAIGN as any,
          functionName: 'getSummary',
        } as any),
        userAddress ? publicClient.readContract({
          address: address as `0x${string}`,
          abi: ABIS.CAMPAIGN as any,
          functionName: 'contributions',
          args: [userAddress as `0x${string}`],
        } as any) : Promise.resolve(0n),
      ]) as [any, bigint];

      if (!summaryData) throw new Error('No summary data found');

      const metaCID = summaryData.metaCID || summaryData[5];
      const metadata = await fetchIPFSJSON(metaCID);

      // 2. Fetch new financial metrics (Safe for legacy contracts)
      let availableFunds = 0n;
      let lockedFunds = 0n;
      
      try {
        [availableFunds, lockedFunds] = await Promise.all([
          publicClient.readContract({
            address: address as `0x${string}`,
            abi: ABIS.CAMPAIGN as any,
            functionName: 'availableFunds',
          } as any),
          publicClient.readContract({
            address: address as `0x${string}`,
            abi: ABIS.CAMPAIGN as any,
            functionName: 'lockedFunds',
          } as any)
        ]) as [bigint, bigint];
      } catch (err) {
        console.warn('Legacy contract detected or funds query failed:', err);
      }

      // 3. Fetch first donation block (Simplified for performance)
      let firstDonationBlock: bigint | null = null;
      // Skip log fetching if not needed or too slow

      setSummary({
        title: metadata?.name || 'Unnamed Campaign',
        description: metadata?.description || '',
        imageHash: metadata?.image || '',
        balance: formatEther(summaryData.balance || summaryData[0]),
        minimumContribution: formatEther(summaryData.minContribution || summaryData[1]),
        numRequests: Number(summaryData.numRequests || summaryData[2]),
        donorsCount: Number(summaryData.donors || summaryData[3]),
        manager: summaryData.managerAddr || summaryData[4],
        active: summaryData.isActive !== undefined ? summaryData.isActive : summaryData[6],
        userContribution: userContribution || 0n,
        firstDonationBlock: firstDonationBlock,
        availableFunds: formatEther(availableFunds || 0n),
        lockedFunds: formatEther(lockedFunds || 0n),
      });
    } catch (err) {
      console.error('Error fetching campaign summary:', err);
      setError('Failed to fetch campaign data.');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refresh: fetchSummary };
}
