import { useState, useEffect, useCallback } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { useWallet } from './useWallet';
import { slugify } from '../utils/slugify';

export interface ManagedCampaign {
  title: string;
  address: string;
  slug: string;
}

export function useUserCampaigns() {
  const { address: userAddress, isConnected } = useWallet();
  const [managedCampaigns, setManagedCampaigns] = useState<ManagedCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchManagedCampaigns = useCallback(async () => {
    if (!isConnected || !userAddress) {
      setManagedCampaigns([]);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get total count of campaigns for this manager
      const count = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY,
        functionName: 'getManagerCount',
        args: [userAddress as `0x${string}`],
      } as any) as bigint;

      const campaignCount = Number(count);
      const campaigns: ManagedCampaign[] = [];

      // 2. Fetch each campaign address and its title
      for (let i = 0; i < campaignCount; i++) {
        const campaignAddr = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
          abi: ABIS.CAMPAIGN_FACTORY,
          functionName: 'campaignsByManager',
          args: [userAddress as `0x${string}`, BigInt(i)],
        } as any) as `0x${string}`;

        const title = await publicClient.readContract({
          address: campaignAddr,
          abi: ABIS.CAMPAIGN,
          functionName: 'campaignName',
        } as any) as string;

        campaigns.push({
          title,
          address: campaignAddr,
          slug: slugify(title),
        });
      }

      setManagedCampaigns(campaigns);
    } catch (err) {
      console.error('Error fetching managed campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, isConnected]);

  useEffect(() => {
    fetchManagedCampaigns();
  }, [fetchManagedCampaigns]);

  return { managedCampaigns, isLoading, refresh: fetchManagedCampaigns };
}
