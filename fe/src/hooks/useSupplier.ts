import { useState, useEffect, useCallback } from 'react';
import { publicClient, getWalletClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { formatEther } from 'viem';


export interface SupplierInfo {
  name: string;
  metadataHash: string;
  totalEarned: string;
  isRegistered: boolean;
}

export function useSupplier(userAddress?: string) {
  const [info, setInfo] = useState<SupplierInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSupplierInfo = useCallback(async () => {
    if (!userAddress) return;
    setIsLoading(true);
    try {
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.SUPPLIER_REGISTRY,
        abi: ABIS.SUPPLIER_REGISTRY,
        functionName: 'suppliers',
        args: [userAddress as `0x${string}`],
      }) as any[];

      setInfo({
        name: data[1] || '',
        metadataHash: data[2] || '',
        totalEarned: formatEther(data[0] || 0n),
        isRegistered: data[3] || false,
      });
    } catch (err) {
      console.error('Error fetching supplier info:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  const updateInfo = async (name: string, metadata: string) => {
    const walletClient = getWalletClient();
    if (!userAddress || !walletClient) return;
    setIsUpdating(true);
    try {
      const { request } = await publicClient.simulateContract({
        account: userAddress as `0x${string}`,
        address: CONTRACT_ADDRESSES.SUPPLIER_REGISTRY,
        abi: ABIS.SUPPLIER_REGISTRY,
        functionName: 'updateSupplierInfo',
        args: [userAddress as `0x${string}`, name, metadata],
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchSupplierInfo();
      return hash;
    } catch (err) {
      console.error('Error updating supplier info:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchSupplierInfo();
  }, [fetchSupplierInfo]);

  return { info, isLoading, isUpdating, updateInfo, refresh: fetchSupplierInfo };
}
