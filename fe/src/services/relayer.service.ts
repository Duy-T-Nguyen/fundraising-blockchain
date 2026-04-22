import { getWalletClient, publicClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES, EIP712_DOMAIN } from '../blockchain/constants';

export interface ForwardRequest {
  from: string;
  to: string;
  value: bigint;
  gas: bigint;
  nonce: bigint;
  data: string;
}

export class RelayerService {
  /**
   * Lấy Nonce mới nhất từ Forwarder contract cho một địa chỉ ví
   */
  static async getNonce(address: string): Promise<bigint> {
    const nonce = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.FORWARDER,
      abi: ABIS.FORWARDER as any,
      functionName: 'getNonce',
      args: [address as `0x${string}`],
    } as any);
    return BigInt(nonce as any);
  }

  /**
   * Thực hiện ký EIP-712 cho ForwardRequest
   */
  static async signRequest(request: ForwardRequest, address: string): Promise<string> {
    const walletClient = getWalletClient();
    if (!walletClient) throw new Error('Wallet not connected');

    const signature = await walletClient.signTypedData({
      account: address as `0x${string}`,
      domain: EIP712_DOMAIN,
      types: {
        ForwardRequest: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'gas', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
      },
      primaryType: 'ForwardRequest',
      message: {
        from: request.from as `0x${string}`,
        to: request.to as `0x${string}`,
        value: request.value,
        gas: request.gas,
        nonce: request.nonce,
        data: request.data as `0x${string}`,
      },
    });

    return signature;
  }

  /**
   * Gửi Intent tới Backend Relayer
   */
  static async submitIntent(forwardRequest: any, signature: string) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1609';
    
    // Chuyển đổi BigInt sang string để JSON hóa
    const serializedRequest = {
      ...forwardRequest,
      value: forwardRequest.value.toString(),
      gas: forwardRequest.gas.toString(),
      nonce: forwardRequest.nonce.toString(),
    };

    const response = await fetch(`${apiUrl}/relayer/intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        forwardRequest: serializedRequest,
        signature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit intent to relayer');
    }

    return response.json();
  }
}
