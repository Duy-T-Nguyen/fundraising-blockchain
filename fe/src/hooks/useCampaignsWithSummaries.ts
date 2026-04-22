import { useState, useEffect, useCallback } from 'react';
import { formatEther } from 'viem';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';

export interface EnrichedCampaign {
  address: string;
  title: string;
  description: string;
  category: number;
  balance: string;
  donorsCount: number;
  active: boolean;
  imageHash: string;
}

export function useCampaignsWithSummaries() {
  const [campaigns, setCampaigns] = useState<EnrichedCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSummaries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch addresses from factory
      // QueryType: 0 (ALL), manager: zero address, category: 0, offset: 0, limit: 50
      const addresses = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY as any,
        functionName: 'getCampaigns',
        args: [0, '0x0000000000000000000000000000000000000000', 0, 0n, 50n],
      } as any) as `0x${string}`[];

      if (!addresses || addresses.length === 0) {
        setCampaigns([]);
        return;
      }

      // 2. Fetch summaries for each address in parallel
      const enrichedData = await Promise.all(
        addresses.map(async (address) => {
          try {
            const [summaryData, title, description, category] = await Promise.all([
              publicClient.readContract({
                address,
                abi: ABIS.CAMPAIGN as any,
                functionName: 'getSummary',
              } as any),
              publicClient.readContract({
                address,
                abi: ABIS.CAMPAIGN as any,
                functionName: 'campaignName',
              } as any),
              publicClient.readContract({
                address,
                abi: ABIS.CAMPAIGN as any,
                functionName: 'description',
              } as any),
              publicClient.readContract({
                address,
                abi: ABIS.CAMPAIGN as any,
                functionName: 'category',
              } as any),
            ]) as [any, string, string, number];

            const data: any = summaryData;
            return {
              address,
              title: title || 'Unnamed Campaign',
              description: description || '',
              category: Number(category),
              balance: formatEther(data.balance || data[0]),
              donorsCount: Number(data.donors || data[3]),
              active: data.isActive !== undefined ? data.isActive : data[6],
              imageHash: data.imgHash || data[5] || '',
            };
          } catch (err) {
            console.error(`Error fetching summary for ${address}:`, err);
            return null;
          }
        })
      );

      // Filter out failures and set state
      setCampaigns(enrichedData.filter((c): c is EnrichedCampaign => c !== null));
    } catch (err) {
      console.error('Error fetching enriched campaigns:', err);
      setError('Failed to fetch campaign data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSummaries();
  }, [fetchAllSummaries]);

  return { campaigns, isLoading, error, refresh: fetchAllSummaries };
}
