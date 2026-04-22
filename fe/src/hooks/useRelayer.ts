import { useState, useCallback } from 'react';
import { RelayerService } from '../services/relayer.service';
import type { ForwardRequest } from '../services/relayer.service';
import { useWallet } from './useWallet';

export function useRelayer() {
  const { address, isConnected } = useWallet();
  const [isRelaying, setIsRelaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeGasless = useCallback(async (
    to: string,
    data: string,
    value: bigint = BigInt(0)
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsRelaying(true);
    setError(null);

    try {
      // 1. Get Nonce
      const nonce = await RelayerService.getNonce(address);

      // 2. Prepare Request
      const request: ForwardRequest = {
        from: address,
        to,
        value,
        gas: BigInt(1000000), // Mặc định 1M gas cho an toàn, AI sẽ tối ưu sau
        nonce,
        data,
      };

      // 3. Sign Request
      const signature = await RelayerService.signRequest(request, address);

      // 4. Submit to Relayer
      const result = await RelayerService.submitIntent(request, signature);
      
      return result;
    } catch (err: any) {
      const msg = err.message || 'Failed to execute gasless transaction';
      setError(msg);
      throw err;
    } finally {
      setIsRelaying(false);
    }
  }, [address, isConnected]);

  return {
    executeGasless,
    isRelaying,
    relayerError: error,
  };
}
