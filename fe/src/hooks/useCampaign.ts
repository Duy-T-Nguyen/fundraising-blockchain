import { useState, useEffect, useCallback } from 'react';
import { formatEther } from 'viem';
import { publicClient } from '../blockchain/client';
import { ABIS } from '../blockchain/constants';

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
      const [summaryData, title, description] = await Promise.all([
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: ABIS.CAMPAIGN as any,
          functionName: 'getSummary',
        } as any),
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: ABIS.CAMPAIGN as any,
          functionName: 'campaignName',
        } as any),
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: ABIS.CAMPAIGN as any,
          functionName: 'description',
        } as any)
      ]) as [any, string, string];

      if (summaryData) {
        // Handle both Array and Object responses from Viem readContract
        const data: any = summaryData;
        
        setSummary({
          title: title || 'Unnamed Campaign',
          description: description || '',
          imageHash: data.imgHash || data[5] || '',
          balance: formatEther(data.balance || data[0]),
          minimumContribution: formatEther(data.minContribution || data[1]),
          numRequests: Number(data.numRequests || data[2]),
          donorsCount: Number(data.donors || data[3]),
          manager: data.managerAddr || data[4],
          active: data.isActive !== undefined ? data.isActive : data[6],
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
