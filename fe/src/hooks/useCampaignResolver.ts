import { useState, useEffect } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { slugify } from '../utils/slugify';

export function useCampaignResolver(slug: string | undefined) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    // Check if slug is already a valid Ethereum address
    if (/^0x[a-fA-F0-9]{40}$/.test(slug)) {
      setAddress(slug);
      setIsLoading(false);
      return;
    }

    const resolveSlug = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Get all campaign addresses from factory
        const addresses = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
          abi: ABIS.CAMPAIGN_FACTORY as any,
          functionName: 'getCampaigns',
          args: [0, '0x0000000000000000000000000000000000000000', 0, 0n, 50n], // Scan up to 50 campaigns
        } as any) as string[];

        if (!addresses || addresses.length === 0) {
          setError('No campaigns found.');
          return;
        }

        // 2. Fetch titles for all addresses in parallel and find match
        const results = await Promise.all(
          addresses.map(async (addr) => {
            try {
              const title = await publicClient.readContract({
                address: addr as `0x${string}`,
                abi: ABIS.CAMPAIGN as any,
                functionName: 'campaignName',
              } as any) as string;
              
              return { address: addr, slug: slugify(title) };
            } catch (e) {
              return { address: addr, slug: '' };
            }
          })
        );

        const match = results.find((r) => r.slug === slug);
        if (match) {
          setAddress(match.address);
        } else {
          setError('Campaign not found.');
        }
      } catch (err) {
        console.error('Error resolving slug:', err);
        setError('Failed to resolve campaign name.');
      } finally {
        setIsLoading(false);
      }
    };

    resolveSlug();
  }, [slug]);

  return { address, isLoading, error };
}
