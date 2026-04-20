import { useState, useCallback, useEffect } from 'react';
import { getAddress } from 'viem';

type WalletState = {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
};

/** Wait until window.ethereum is injected by MetaMask (up to 1s) */
function waitForEthereum(): Promise<typeof window.ethereum> {
  return new Promise((resolve) => {
    if (window.ethereum) {
      resolve(window.ethereum);
      return;
    }
    // MetaMask fires this event once it finishes injecting
    const onInit = () => {
      window.removeEventListener('ethereum#initialized', onInit);
      resolve(window.ethereum);
    };
    window.addEventListener('ethereum#initialized', onInit);
    // Fallback: resolve after 1s even if no event fires
    setTimeout(() => {
      window.removeEventListener('ethereum#initialized', onInit);
      resolve(window.ethereum);
    }, 1000);
  });
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  });

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      const eth = await waitForEthereum();
      if (!eth) return;
      try {
        const accounts = await eth.request({ method: 'eth_accounts' }) as string[];
        if (accounts.length > 0) {
          const checksumAddress = getAddress(accounts[0]);
          setState((prev) => ({ ...prev, address: checksumAddress, isConnected: true }));
        }
      } catch {
        // ignore
      }
    };
    checkConnection();

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        setState({ address: null, isConnecting: false, isConnected: false, error: null });
      } else {
        const checksumAddress = getAddress(accs[0]);
        setState((prev) => ({ ...prev, address: checksumAddress, isConnected: true }));
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    const eth = await waitForEthereum();

    if (!eth) {
      setState((prev) => ({ ...prev, isConnecting: false }));
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[];
      const checksumAddress = getAddress(accounts[0]);
      setState({
        address: checksumAddress,
        isConnecting: false,
        isConnected: true,
        error: null,
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error && err.message.toLowerCase().includes('reject')
          ? 'Connection rejected by user.'
          : 'Failed to connect wallet.';
      setState({ address: null, isConnecting: false, isConnected: false, error: errorMsg });
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, isConnecting: false, isConnected: false, error: null });
  }, []);

  const shortAddress = state.address
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : null;

  return { ...state, shortAddress, connect, disconnect };
}
