import { useState, useEffect, useCallback } from 'react';
import { publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';

export interface Supplier {
  address: string;
  name: string;
}

// v1.0.1 - Forced Refresh
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use the paginated getSuppliers function which returns names
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.SUPPLIER_REGISTRY,
        abi: ABIS.SUPPLIER_REGISTRY as any,
        functionName: 'getSuppliers',
        args: [0n, 100n], // Fetch first 100 suppliers
      }) as [string[], string[], string[], bigint[]];
      
      const [addresses, names] = data;
      
      const mappedSuppliers: Supplier[] = addresses.map((addr, i) => ({
        address: addr,
        name: names[i] || 'Unknown Supplier',
      }));
      
      setSuppliers(mappedSuppliers);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      // Fallback to empty list or basic address list if the new function fails
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return { suppliers, isLoading, refresh: fetchSuppliers };
}
