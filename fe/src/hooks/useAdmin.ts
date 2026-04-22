import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { publicClient, getWalletClient } from '../blockchain/client';
import { CONTRACT_ADDRESSES, ABIS } from '../blockchain/constants';
import { formatEther, parseEther } from 'viem';

export type CampaignRequest = {
  id: number;
  manager: string;
  name: string;
  description: string;
  imageHash: string;
  category: number;
  minimumContribution: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  deployedAddress: string;
};

export type Supplier = {
  address: string;
  name: string;
  metadataHash: string;
  totalEarned: string;
};

export type GlobalStats = {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalDonated: string;
  totalDonors: number;
  factoryBalance: string;
  antiSpamFee: string;
};

export const useAdmin = () => {
  const { address, isConnected } = useWallet();
  const [adminAddress, setAdminAddress] = useState<string | null>(null);
  const [requests, setRequests] = useState<CampaignRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = isConnected && address && adminAddress && address.toLowerCase() === adminAddress.toLowerCase();

  const fetchAdminData = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Admin Address & Spam Fee & Stats from Factory
      const [admin, fee, globalStats, balance] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
          abi: ABIS.CAMPAIGN_FACTORY,
          functionName: 'admin',
        }) as Promise<string>,
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
          abi: ABIS.CAMPAIGN_FACTORY,
          functionName: 'antiSpamFee',
        }) as Promise<bigint>,
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
          abi: ABIS.CAMPAIGN_FACTORY,
          functionName: 'getGlobalStats',
        }) as Promise<[bigint, bigint]>,
        publicClient.getBalance({ address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY }),
      ]);

      setAdminAddress(admin);

      // 2. Fetch Campaign Requests (Recent 50)
      const requestsData = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY,
        functionName: 'getCampaignRequests',
        args: [BigInt(0), BigInt(50)],
      }) as [any[], bigint];

      const formattedRequests = requestsData[0].map((r, i) => ({
        id: i,
        manager: r.manager,
        name: r.name,
        description: r.description,
        imageHash: r.imageHash,
        category: r.category,
        minimumContribution: formatEther(r.minimumContribution),
        status: ['PENDING', 'APPROVED', 'REJECTED'][r.status] as any,
        deployedAddress: r.deployedAddress,
      }));
      setRequests(formattedRequests);

      // 3. Fetch Suppliers
      const suppliersData = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.SUPPLIER_REGISTRY,
        abi: ABIS.SUPPLIER_REGISTRY,
        functionName: 'getSuppliers',
        args: [BigInt(0), BigInt(100)],
      }) as [string[], string[], string[], bigint[]];

      const formattedSuppliers = suppliersData[0].map((addr, i) => ({
        address: addr,
        name: suppliersData[1][i],
        metadataHash: suppliersData[2][i],
        totalEarned: formatEther(suppliersData[3][i]),
      }));
      setSuppliers(formattedSuppliers);

      // 4. Advanced Stats (Active vs Completed & Total Donors)
      // Get all campaign addresses
      const campaignAddresses = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY,
        functionName: 'getCampaigns',
        args: [0, '0x0000000000000000000000000000000000000000', 0, BigInt(0), BigInt(100)],
      }) as `0x${string}`[];

      let activeCount = 0;
      let donorSum = 0;

      if (campaignAddresses.length > 0) {
        const campaignData = await Promise.all(campaignAddresses.map(async (addr) => {
          try {
            return await publicClient.multicall({
              contracts: [
                { address: addr, abi: ABIS.CAMPAIGN, functionName: 'active' },
                { address: addr, abi: ABIS.CAMPAIGN, functionName: 'totalDonors' },
              ]
            });
          } catch { return null; }
        }));

        campaignData.forEach((data: any) => {
          if (data && data[0].status === 'success' && data[0].result) activeCount++;
          if (data && data[1].status === 'success') donorSum += Number(data[1].result);
        });
      }

      setStats({
        totalCampaigns: Number(globalStats[0]),
        activeCampaigns: activeCount,
        completedCampaigns: Number(globalStats[0]) - activeCount,
        totalDonated: formatEther(globalStats[1]),
        totalDonors: donorSum,
        factoryBalance: formatEther(balance),
        antiSpamFee: formatEther(fee),
      });

    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Actions
  const approveRequest = async (id: number) => {
    const walletClient = getWalletClient();
    if (!walletClient || !address) return;
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
      abi: ABIS.CAMPAIGN_FACTORY,
      functionName: 'approveCampaignRequest',
      args: [BigInt(id)],
      account: address as `0x${string}`,
    });
    return hash;
  };

  const rejectRequest = async (id: number) => {
    const walletClient = getWalletClient();
    if (!walletClient || !address) return;
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
      abi: ABIS.CAMPAIGN_FACTORY,
      functionName: 'rejectCampaignRequest',
      args: [BigInt(id)],
      account: address as `0x${string}`,
    });
    return hash;
  };

  const updateSpamFee = async (newFeeEther: string) => {
    const walletClient = getWalletClient();
    if (!walletClient || !address) return;
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
      abi: ABIS.CAMPAIGN_FACTORY,
      functionName: 'updateAntiSpamFee',
      args: [parseEther(newFeeEther)],
      account: address as `0x${string}`,
    });
    return hash;
  };

  const withdrawFactoryFees = async () => {
    const walletClient = getWalletClient();
    if (!walletClient || !address) return;
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
      abi: ABIS.CAMPAIGN_FACTORY,
      functionName: 'withdrawFees',
      account: address as `0x${string}`,
    });
    return hash;
  };

  const addSupplier = async (supplierAddr: string, name: string, metadata: string) => {
    const walletClient = getWalletClient();
    if (!walletClient || !address) return;
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESSES.SUPPLIER_REGISTRY,
      abi: ABIS.SUPPLIER_REGISTRY,
      functionName: 'addSupplier',
      args: [supplierAddr as `0x${string}`, name, metadata],
      account: address as `0x${string}`,
    });
    return hash;
  };

  const removeSupplier = async (supplierAddr: string) => {
    const walletClient = getWalletClient();
    if (!walletClient || !address) return;
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESSES.SUPPLIER_REGISTRY,
      abi: ABIS.SUPPLIER_REGISTRY,
      functionName: 'removeSupplier',
      args: [supplierAddr as `0x${string}`],
      account: address as `0x${string}`,
    });
    return hash;
  };

  const withdrawCampaignGas = async (campaignAddr: string) => {
    const walletClient = getWalletClient();
    if (!walletClient || !address) return;
    const hash = await walletClient.writeContract({
      address: campaignAddr as `0x${string}`,
      abi: ABIS.CAMPAIGN,
      functionName: 'withdrawGasFunds',
      account: address as `0x${string}`,
    });
    return hash;
  };

  return {
    address,
    adminAddress,
    isAdmin,
    requests,
    suppliers,
    stats,
    loading,
    error,
    refresh: fetchAdminData,
    approveRequest,
    rejectRequest,
    updateSpamFee,
    withdrawFactoryFees,
    addSupplier,
    removeSupplier,
    withdrawCampaignGas
  };
};
