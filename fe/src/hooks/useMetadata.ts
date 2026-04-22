import { useCallback } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS } from '../blockchain/constants';

// In-memory cache to persist during session
const nameCache: Record<string, string> = {};
const timestampCache: Record<number, string> = {};

export function useMetadata() {
  const getCampaignName = useCallback(async (address: `0x${string}`) => {
    if (nameCache[address]) return nameCache[address];

    try {
      const name = await publicClient.readContract({
        address,
        abi: ABIS.CAMPAIGN as any,
        functionName: 'campaignName',
      } as any) as string;
      
      nameCache[address] = name;
      return name;
    } catch {
      return 'Campaign';
    }
  }, []);

  const getBlockTimestamp = useCallback(async (blockNumber: bigint) => {
    const num = Number(blockNumber);
    if (timestampCache[num]) return timestampCache[num];

    try {
      const block = await publicClient.getBlock({ blockNumber });
      const date = new Date(Number(block.timestamp) * 1000).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      
      timestampCache[num] = date;
      return date;
    } catch {
      return 'Recent';
    }
  }, []);

  return { getCampaignName, getBlockTimestamp };
}
