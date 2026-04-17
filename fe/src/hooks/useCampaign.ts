import { useState, useEffect, useCallback } from 'react';
import { formatEther } from 'viem';
import { publicClient } from '../blockchain/client';
import { ABIS } from '../blockchain/constants';

export interface CampaignSummary {
  title: string;
  balance: string;
  minimumContribution: string;
  numRequests: number;
  donorsCount: number;
  manager: string;
  active: boolean;
}

export function useCampaign(address: string | undefined) {
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Fetch summary and title in parallel
      const [summaryData, title] = await Promise.all([
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: ABIS.CAMPAIGN as any,
          functionName: 'getSummary',
        } as any),
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: ABIS.CAMPAIGN as any,
          functionName: 'campaignName',
        } as any)
      ]) as [any, string];

      if (summaryData) {
        setSummary({
          title: title || 'Unnamed Campaign',
          balance: formatEther(summaryData[0]),
          minimumContribution: formatEther(summaryData[1]),
          numRequests: Number(summaryData[2]),
          donorsCount: Number(summaryData[3]),
          manager: summaryData[4],
          active: summaryData[5],
        });
      }
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
