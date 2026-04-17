import CampaignFactoryABI from './abis/CampaignFactory.json';
import CampaignABI from './abis/Campaign.json';
import SupplierRegistryABI from './abis/SupplierRegistry.json';

export const CONTRACT_ADDRESSES = {
  CAMPAIGN_FACTORY: '0xC178A1E8054b2aC73E43d10a6EBa573C12FA24ce' as const,
  SUPPLIER_REGISTRY: '0x34569f934dC3a22Fb5e3bd8D688FA4244bF9066f' as const,
};

export const ABIS = {
  CAMPAIGN_FACTORY: CampaignFactoryABI.abi,
  CAMPAIGN: CampaignABI.abi,
  SUPPLIER_REGISTRY: SupplierRegistryABI.abi,
};

export const SEPOLIA_CHAIN_ID = 11155111;
