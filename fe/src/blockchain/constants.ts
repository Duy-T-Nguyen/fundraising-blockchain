import CampaignFactoryABI from './abis/CampaignFactory.json';
import CampaignABI from './abis/Campaign.json';
import SupplierRegistryABI from './abis/SupplierRegistry.json';
import ForwarderABI from './abis/Forwarder.json';

export const CONTRACT_ADDRESSES = {
  CAMPAIGN_FACTORY: (import.meta.env.VITE_CAMPAIGN_FACTORY_ADDRESS) as `0x${string}`,
  SUPPLIER_REGISTRY: (import.meta.env.VITE_SUPPLIER_REGISTRY_ADDRESS) as `0x${string}`,
  FORWARDER: (import.meta.env.VITE_FORWARDER_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`,
};
  
export const ABIS = {
  CAMPAIGN_FACTORY: CampaignFactoryABI.abi,
  CAMPAIGN: CampaignABI.abi,
  SUPPLIER_REGISTRY: SupplierRegistryABI.abi,
  FORWARDER: ForwarderABI.abi,
} as const;

export const SEPOLIA_CHAIN_ID = 11155111;

export const EIP712_DOMAIN = {
  name: 'FundraisingForwarder',
  version: '1',
  chainId: SEPOLIA_CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESSES.FORWARDER,
} as const;
