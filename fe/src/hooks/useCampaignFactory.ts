import { useState, useEffect, useCallback } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';

export function useCampaignFactory() {
  const [campaignAddresses, setCampaignAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // QueryType: 0 (ALL), manager: zero address, category: 0, offset: 0, limit: 20
      const addresses = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY as any,
        functionName: 'getCampaigns',
        args: [0, '0x0000000000000000000000000000000000000000', 0, 0n, 20n],
      } as any) as any;
      
      setCampaignAddresses([...addresses]);
    } catch (err) {
      console.error('Error fetching campaigns from factory:', err);
      setError('Failed to fetch campaigns.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaignAddresses, isLoading, error, refresh: fetchCampaigns };
}
