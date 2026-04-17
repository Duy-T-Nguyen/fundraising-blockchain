import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { sepolia } from 'viem/chains';

// Public client is for reading data from the blockchain (doesn't require a wallet)
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// Wallet client is for sending transactions (requires MetaMask/Wallet connection)
export const getWalletClient = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum),
    });
  }
  return null;
};
