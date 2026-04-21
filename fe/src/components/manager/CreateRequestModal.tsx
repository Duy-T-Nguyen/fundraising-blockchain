import React, { useState, useRef, useCallback } from 'react';
import { publicClient, getWalletClient } from '../../blockchain/client';
import { ABIS } from '../../blockchain/constants';
import { encodeFunctionData, parseEther, formatEther } from 'viem';
import { useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle2, ImagePlus, Loader2, ChevronDown } from 'lucide-react';
import { useSuppliers } from '../../hooks/useSuppliers';

interface CreateRequestModalProps {
  address: string;
  onClose: () => void;
  onSuccess: () => void;
}

// v1.0.1 - Forced Refresh
const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ address, onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [recipient, setRecipient] = useState('');
  const [verifier, setVerifier] = useState(''); // Initial empty
  
  // Image handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [campaignBalance, setCampaignBalance] = useState<string>('0');

  const { suppliers, isLoading: loadingSuppliers } = useSuppliers();

  // Fetch campaign balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await publicClient.getBalance({ address: address as `0x${string}` });
        setCampaignBalance(parseFloat(formatEther(balance)).toFixed(4));
      } catch (err) {
        console.error('Error fetching balance:', err);
      }
    };
    fetchBalance();
  }, [address]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.ethereum || !selectedFile) return;

    setIsLoading(true);
    setStatus('pending');
    setErrorMessage('');

    try {
      const walletClient = getWalletClient();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const userAccount = accounts[0];

      if (!walletClient || !userAccount) throw new Error('Wallet not connected');

      // 1. Sign message for Backend verification (MUST match backend exactly: 'FundChain IPFS Upload')
      const message = 'FundChain IPFS Upload';
      const signature = await walletClient.signMessage({
        account: userAccount as `0x${string}`,
        message,
      });

      // 2. Upload to Backend (IPFS)
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('address', userAccount);
      formData.append('signature', signature);

      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evidence/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.message || 'Failed to upload evidence to IPFS');
      }

      const { cid } = await uploadRes.json();
      const ipfsHash = `ipfs://${cid}`;

      // 3. Encode function data (WFP v4.0 expects 5 args: desc, value, recipient, verifier, evidenceHash)
      const data = encodeFunctionData({
        abi: ABIS.CAMPAIGN,
        functionName: 'createRequest',
        args: [description, parseEther(value), recipient as `0x${string}`, verifier as `0x${string}`, ipfsHash],
      });

      // 4. Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAccount,
          to: address,
          data: data,
        }],
      });

      console.log('Transaction sent:', txHash);
      
      // 5. Wait for receipt
      await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
      
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error creating request:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to create request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Create Spending Request</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Transparency is key</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Purpose / Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Purpose / Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will these funds be used for?"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none h-20 font-medium text-gray-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (ETH)</label>
              <input
                type="number"
                step="0.0001"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.0"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
              />
              <div className="flex items-center gap-1.5 ml-2 mt-1">
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">Available: {campaignBalance} ETH</span>
              </div>
            </div>

            {/* Verifier Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Verifier / Inspector Address</label>
              <input
                type="text"
                required
                value={verifier}
                onChange={(e) => setVerifier(e.target.value)}
                placeholder="0x..."
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-xs text-gray-500"
              />
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest ml-2 mt-1">Authorized entity to verify delivery</p>
            </div>
          </div>

            {/* Evidence (Image Upload) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Evidence / Receipt (Image)</label>
              <div
                className={`relative border-2 border-dashed rounded-2xl overflow-hidden h-32 flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer
                  ${imagePreview ? 'border-blue-400 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                    <div className="z-10 flex flex-col items-center">
                      <CheckCircle2 className="text-blue-500 mb-1" size={20} />
                      <span className="text-[10px] font-black text-blue-600 uppercase">Image Selected</span>
                    </div>
                  </>
                ) : (
                  <>
                    <ImagePlus size={24} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center px-4">
                      Upload Proof (JPG, PNG)
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>
            </div>

          {/* Recipient Address (Supplier Selection) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recipient (Registered Supplier)</label>
            <div className="relative">
              <select
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full appearance-none px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-xs font-bold text-blue-600 cursor-pointer"
              >
                <option value="" disabled>Select a verified supplier...</option>
                {Array.isArray(suppliers) && suppliers.map((s, idx) => (
                  <option key={s.address || idx} value={s.address}>
                    {s.name || 'Unknown'} ({s.address ? `${s.address.slice(0, 6)}...${s.address.slice(-4)}` : 'No Address'})
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {loadingSuppliers && (
              <p className="text-[9px] text-blue-400 font-bold uppercase animate-pulse ml-1">Fetching authorized suppliers...</p>
            )}
          </div>

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
              <AlertCircle size={18} />
              {errorMessage}
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold">
              <CheckCircle2 size={18} />
              Request created successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || status === 'success' || !selectedFile}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all hover:shadow-xl hover:shadow-black/10 disabled:opacity-50"
          >
            {isLoading ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : (
              <>
                <Send size={18} />
                Submit Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;
