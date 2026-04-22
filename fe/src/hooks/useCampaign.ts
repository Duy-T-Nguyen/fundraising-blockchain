import { useState, useEffect, useCallback, useRef } from 'react';
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
  userDonorId: bigint;
  firstDonationBlock: bigint | null;
  availableFunds: string;
  lockedFunds: string;
}

export function useCampaign(address: string | undefined, userAddress?: string) {
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  const fetchSummary = useCallback(async () => {
    if (!address) return;
    
    const currentFetchId = ++fetchIdRef.current;
    
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[useCampaign] Querying data for Campaign: ${address} | User: ${userAddress}`);

      // 1. Fetch BASIC summary info, user contribution, and donorId
      const [summaryData, userContribution, userDonorId] = await Promise.all([
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
        } as any) : Promise.resolve(BigInt(0)),
        userAddress ? publicClient.readContract({
          address: address as `0x${string}`,
          abi: ABIS.CAMPAIGN as any,
          functionName: 'donorId',
          args: [userAddress as `0x${string}`],
        } as any) : Promise.resolve(BigInt(0)),
      ]) as [any, bigint, bigint];

      console.log(`[useCampaign] RAW RESULTS:`, {
        summaryData,
        userContribution: userContribution?.toString(),
        userDonorId: userDonorId?.toString()
      });

      if (!summaryData) throw new Error('No summary data found');

      const metaCID = summaryData.metaCID || summaryData[5];
      const metadata = await fetchIPFSJSON(metaCID);

      // 2. Fetch new financial metrics (Safe for legacy contracts)
      let availableFunds = BigInt(0);
      let lockedFunds = BigInt(0);
      
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

      // Check if this fetch is still the latest one before updating state
      if (currentFetchId !== fetchIdRef.current) {
        console.log(`[useCampaign] Ignoring stale response for fetch ID ${currentFetchId} (Latest is ${fetchIdRef.current})`);
        return;
      }

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
        userContribution: userContribution || BigInt(0),
        userDonorId: userDonorId || BigInt(0),
        firstDonationBlock: firstDonationBlock,
        availableFunds: formatEther(availableFunds || BigInt(0)),
        lockedFunds: formatEther(lockedFunds || BigInt(0)),
      });
    } catch (err) {
      console.error('Error fetching campaign summary:', err);
      setError('Failed to fetch campaign data.');
    } finally {
      setIsLoading(false);
    }
  }, [address, userAddress]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refresh: fetchSummary };
}
