import CampaignFactoryABI from './abis/CampaignFactory.json';
import CampaignABI from './abis/Campaign.json';
import SupplierRegistryABI from './abis/SupplierRegistry.json';

export const CONTRACT_ADDRESSES = {
  CAMPAIGN_FACTORY: (import.meta.env.VITE_CAMPAIGN_FACTORY_ADDRESS || '0x9F24fd3F2c387Ed8CEa41621ca001faAfC385952') as `0x${string}`,
  SUPPLIER_REGISTRY: (import.meta.env.VITE_SUPPLIER_REGISTRY_ADDRESS || '0x13f469706e509B7E4aB4Eca1Ec580A42bE7b79d7') as `0x${string}`,
};
  
export const ABIS = {
  CAMPAIGN_FACTORY: CampaignFactoryABI.abi,
  CAMPAIGN: CampaignABI.abi,
  SUPPLIER_REGISTRY: SupplierRegistryABI.abi,
};

export const SEPOLIA_CHAIN_ID = 11155111;
