import { useState, useEffect, useCallback } from 'react';
import { formatEther } from 'viem';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { fetchIPFSJSON } from '../utils/ipfs';

export interface EnrichedCampaign {
  address: string;
  manager: string;
  title: string;
  description: string;
  category: number;
  balance: string;
  raised: string;
  disbursed: string;
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
      const addresses = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY as any,
        functionName: 'getCampaigns',
        args: [0, '0x0000000000000000000000000000000000000000', 0, BigInt(0), BigInt(50)],
      } as any) as `0x${string}`[];

      if (!addresses || addresses.length === 0) {
        setCampaigns([]);
        return;
      }

      // 2. Fetch summaries for each address in parallel
      const enrichedData = await Promise.all(
        addresses.map(async (address) => {
          try {
            const [summaryData, category, manager, totalFundsRaised] = await Promise.all([
              publicClient.readContract({
                address,
                abi: ABIS.CAMPAIGN as any,
                functionName: 'getSummary',
              } as any),
              publicClient.readContract({
                address,
                abi: ABIS.CAMPAIGN as any,
                functionName: 'category',
              } as any),
              publicClient.readContract({
                address,
                abi: ABIS.CAMPAIGN as any,
                functionName: 'manager',
              } as any),
              publicClient.readContract({
                address,
                abi: ABIS.CAMPAIGN as any,
                functionName: 'totalFundsRaised',
              } as any),
            ]) as [any, number, string, bigint];

            const data: any = summaryData;
            const metaCID = data.metaCID || data[5];
            const metadata = await fetchIPFSJSON(metaCID);
            
            const balanceVal = data.balance || data[0];
            const raisedVal = totalFundsRaised; // Use the explicitly fetched value

            return {
              address,
              manager,
              title: metadata?.name || 'Active Project',
              description: metadata?.description || '',
              category: Number(category),
              balance: formatEther(balanceVal),
              raised: formatEther(raisedVal),
              disbursed: formatEther(raisedVal - balanceVal),
              donorsCount: Number(data.donors || data[3]),
              active: data.isActive !== undefined ? data.isActive : data[6],
              imageHash: metadata?.image || '',
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
