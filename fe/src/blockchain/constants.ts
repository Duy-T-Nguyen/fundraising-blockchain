import CampaignFactoryABI from './abis/CampaignFactory.json';
import CampaignABI from './abis/Campaign.json';
import SupplierRegistryABI from './abis/SupplierRegistry.json';

export const CONTRACT_ADDRESSES = {
  CAMPAIGN_FACTORY: (import.meta.env.VITE_CAMPAIGN_FACTORY_ADDRESS || '0x9FCc4133983903EdADB61D592450079c2185d750') as `0x${string}`,
  SUPPLIER_REGISTRY: (import.meta.env.VITE_SUPPLIER_REGISTRY_ADDRESS || '0xA3531Cfaa721604a4cf85D93402f5985fa7e1CC3') as `0x${string}`,
};
  
export const ABIS = {
  CAMPAIGN_FACTORY: CampaignFactoryABI.abi,
  CAMPAIGN: CampaignABI.abi,
  SUPPLIER_REGISTRY: SupplierRegistryABI.abi,
};

export const SEPOLIA_CHAIN_ID = 11155111;
