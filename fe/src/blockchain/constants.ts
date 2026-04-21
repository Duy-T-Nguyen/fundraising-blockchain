import CampaignFactoryABI from './abis/CampaignFactory.json';
import CampaignABI from './abis/Campaign.json';
import SupplierRegistryABI from './abis/SupplierRegistry.json';

export const CONTRACT_ADDRESSES = {
  CAMPAIGN_FACTORY: (import.meta.env.VITE_CAMPAIGN_FACTORY_ADDRESS) as `0x${string}`,
  SUPPLIER_REGISTRY: (import.meta.env.VITE_SUPPLIER_REGISTRY_ADDRESS) as `0x${string}`,
};
  
export const ABIS = {
  CAMPAIGN_FACTORY: CampaignFactoryABI.abi,
  CAMPAIGN: CampaignABI.abi,
  SUPPLIER_REGISTRY: SupplierRegistryABI.abi,
} as const;

export const SEPOLIA_CHAIN_ID = 11155111;
