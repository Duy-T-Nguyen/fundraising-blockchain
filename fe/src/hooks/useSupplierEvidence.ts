import { useState, useEffect, useRef } from 'react';
import { getWalletClient } from '../blockchain/client';

export function useSupplierEvidence(userAddress: string | undefined, isConnected: boolean, connect: () => void) {
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
  const [uploadedEvidences, setUploadedEvidences] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('supplier_uploaded_evidences') || '{}');
    } catch {
      return {};
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTaskRef = useRef<{ campaignAddress: string; requestId: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('supplier_uploaded_evidences', JSON.stringify(uploadedEvidences));
  }, [uploadedEvidences]);

  const openIPFS = (hash: string) => {
    if (!hash) return;
    const cid = hash.replace('ipfs://', '');
    window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank');
  };

  const startUpload = (campaignAddress: string, requestId: number) => {
    activeTaskRef.current = { campaignAddress, requestId };
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, onSuccess?: () => void) => {
    const file = e.target.files?.[0];
    if (!file || !activeTaskRef.current || !userAddress) return;

    if (!isConnected) {
      connect();
      return;
    }

    const { campaignAddress, requestId } = activeTaskRef.current;
    const taskKey = `${campaignAddress}-${requestId}`;
    setUploadingTaskId(taskKey);

    try {
      const walletClient = getWalletClient();
      if (!walletClient) throw new Error('Wallet not connected');

      // 1. Authenticate with signature
      const message = 'FundChain IPFS Upload';
      const signature = await walletClient.signMessage({
        account: userAddress as `0x${string}`,
        message,
      });

      // 2. Upload to IPFS via Backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('address', userAddress);
      formData.append('signature', signature);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evidence/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Verification failed');
      }

      const { cid } = await res.json();

      // 3. Submit proof CID to Smart Contract (write on-chain)
      const { ABIS, CONTRACT_ADDRESSES } = await import('../blockchain/constants');
      
      // Try gasless relayer first, fall back to direct tx
      let txSent = false;
      try {
        const relayRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/relay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: campaignAddress,
            functionName: 'submitProof',
            args: [requestId, cid],
            abi: ABIS.CAMPAIGN,
            from: userAddress,
            signature,
          }),
        });
        if (relayRes.ok) txSent = true;
      } catch {
        // Relayer not available, use direct tx
      }

      if (!txSent) {
        const { publicClient } = await import('../blockchain/client');
        const { encodeFunctionData } = await import('viem');
        const data = encodeFunctionData({
          abi: ABIS.CAMPAIGN,
          functionName: 'submitProof',
          args: [BigInt(requestId), cid],
        });
        await walletClient.sendTransaction({
          account: userAddress as `0x${string}`,
          to: campaignAddress as `0x${string}`,
          data,
        });
      }

      console.log(`[Evidence] Proof submitted on-chain for req #${requestId}: ${cid}`);
      
      // 4. Update local state for immediate UI feedback
      setUploadedEvidences(prev => ({ ...prev, [taskKey]: cid }));
      
      if (onSuccess) onSuccess();
      
      return cid;
    } catch (err: any) {
      console.error('Evidence upload failed:', err);
      throw err;
    } finally {
      setUploadingTaskId(null);
      activeTaskRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return {
    uploadingTaskId,
    uploadedEvidences,
    fileInputRef,
    startUpload,
    handleFileChange,
    openIPFS
  };
}
