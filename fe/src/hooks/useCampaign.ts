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
  userContribution: bigint;
  firstDonationBlock: bigint | null; // Added to track when they first donated
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
      // 1. Fetch BASIC summary info that shouldn't fail
      const [summaryData, title, description, userContribution] = await Promise.all([
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
        } as any),
        userAddress ? publicClient.readContract({
          address: address as `0x${string}`,
          abi: ABIS.CAMPAIGN as any,
          functionName: 'contributions',
          args: [userAddress as `0x${string}`],
        } as any) : Promise.resolve(0n)
      ]) as [any, string, string, bigint];

      // 2. Fetch first donation block SEPARATELY (this is more likely to fail/timeout)
      let firstDonationBlock: bigint | null = null;
      if (userAddress) {
        try {
          const donationLogs = await publicClient.getLogs({
            address: address as `0x${string}`,
            event: {
              type: 'event',
              name: 'Donation',
              inputs: [
                { type: 'address', name: 'donor', indexed: true },
                { type: 'uint256', name: 'amount', indexed: false }
              ],
            },
            args: { donor: userAddress as `0x${string}` },
            fromBlock: BigInt(Math.max(0, Number(await publicClient.getBlockNumber()) - 40000)), // Search last 40k blocks
          });
          
          if (donationLogs.length > 0) {
            firstDonationBlock = donationLogs.reduce((min, log) => 
              log.blockNumber < min ? log.blockNumber : min, donationLogs[0].blockNumber
            );
          }
        } catch (logErr) {
          console.warn('Failed to fetch donation logs, using default state:', logErr);
        }
      }

      if (summaryData) {
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
          userContribution: userContribution || 0n,
          firstDonationBlock: firstDonationBlock,
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
