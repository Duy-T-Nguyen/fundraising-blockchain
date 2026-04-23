import React, { useState, useRef, useCallback } from 'react';
import { publicClient, getWalletClient } from '../../blockchain/client';
import { ABIS } from '../../blockchain/constants';
import { encodeFunctionData, parseEther, formatEther } from 'viem';
import { useEffect } from 'react';
import { X, Send, ImagePlus, Loader2, ChevronDown, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useRelayer } from '../../hooks/useRelayer';
import { useNotification } from '../../context/NotificationContext';

interface CreateRequestModalProps {
  address: string;
  onClose: () => void;
  onSuccess: () => void;
}

// v1.1.0 - AI Relayer Integrated
const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ address, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [recipient, setRecipient] = useState('');
  const [verifier, setVerifier] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGasless, setIsGasless] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [campaignBalance, setCampaignBalance] = useState<string>('0');


  const { suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const { executeGasless, isRelaying, relayerError } = useRelayer();
  const toast = useNotification();

  // Fetch campaign balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Try to get available funds from the contract logic (balance - lockedFunds)
        let balance;
        try {
          balance = await publicClient.readContract({
            address: address as `0x${string}`,
            abi: ABIS.CAMPAIGN as any,
            functionName: 'availableFunds',
            authorizationList: undefined
          }) as bigint;
        } catch (e) {
          // Fallback to raw balance if availableFunds function doesn't exist
          balance = await publicClient.getBalance({ address: address as `0x${string}` });
        }
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

    try {
      const walletClient = getWalletClient();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const userAccount = accounts[0];

      if (!walletClient || !userAccount) throw new Error('Wallet not connected');

      // 1. Sign message for Backend verification
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

      const { cid: imageCid } = await uploadRes.json();
      const imageUrl = `ipfs://${imageCid}`;

      // 3. Upload Metadata JSON to Backend (IPFS)
      const metadata = {
        title: title.trim(),
        description: description.trim(),
        evidence: imageUrl,
        value: value,
        recipient,
        verifier,
      };

      const metaRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evidence/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata,
          address: userAccount,
          signature,
        }),
      });

      if (!metaRes.ok) {
        const errData = await metaRes.json();
        throw new Error(errData.message || 'Failed to upload metadata to IPFS');
      }

      const { cid: metadataCid } = await metaRes.json();

      if (isGasless) {
        // Method A: AI Relayer (Gasless!)
        const callData = encodeFunctionData({
          abi: ABIS.CAMPAIGN,
          functionName: 'createRequest',
          args: [metadataCid, parseEther(value), recipient as `0x${string}`, verifier as `0x${string}`],
        });

        console.log('Sending via AI Relayer...');
        await executeGasless(address, callData);
      } else {
        // Method B: Direct Transaction (User pays gas)
        console.log('Sending direct transaction...');
        const { request } = await publicClient.simulateContract({
          account: userAccount as `0x${string}`,
          address: address as `0x${string}`,
          abi: ABIS.CAMPAIGN,
          functionName: 'createRequest',
          args: [metadataCid, parseEther(value), recipient as `0x${string}`, verifier as `0x${string}`],
        });

        const hash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setStatus('success');
      toast.success('Request created successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating request:', err);
      const msg = err.message || relayerError || 'Failed to create request';
      setStatus('error');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
      {/* Glow orbs behind modal */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl shadow-black/60 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em]">Transparency is key</p>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Create Spending Request</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Request Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Request Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Emergency Medical Supplies"
              className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 outline-none transition-all font-bold text-white placeholder-white/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Detailed Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about how the funds will be used..."
              className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 outline-none transition-all resize-none h-24 font-medium text-white/80 placeholder-white/20 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Amount (ETH)</label>
              <input
                type="number"
                step="0.0001"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.0"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 outline-none transition-all font-black text-white placeholder-white/20"
              />
              <div className="flex items-center gap-1.5 ml-2 mt-1">
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">Available: {campaignBalance} ETH </span>
              </div>
            </div>

            {/* Verifier Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Verifier / Inspector Address</label>
              <input
                type="text"
                required
                value={verifier}
                onChange={(e) => setVerifier(e.target.value)}
                placeholder="0x..."
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 outline-none transition-all font-mono text-xs text-white/70 placeholder-white/20"
              />
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-2 mt-1">Authorized entity to verify delivery</p>
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Evidence / Receipt (Image)</label>
            <div
              className={`relative border-2 border-dashed rounded-2xl overflow-hidden h-32 flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer
                  ${imagePreview ? 'border-blue-400/60 bg-blue-500/10' : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25'}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  <div className="z-10 flex flex-col items-center">
                    <CheckCircle2 className="text-blue-400 mb-1" size={20} />
                    <span className="text-[10px] font-black text-blue-300 uppercase">Image Selected</span>
                  </div>
                </>
              ) : (
                <>
                  <ImagePlus size={24} className="text-white/25" />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest text-center px-4">
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

          {/* Recipient Supplier */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Recipient (Registered Supplier)</label>
            <div className="relative">
              <select
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full appearance-none px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 outline-none transition-all font-mono text-xs font-bold text-blue-300 cursor-pointer"
              >
                <option value="" disabled className="bg-slate-900 text-white/50">Select a verified supplier...</option>
                {Array.isArray(suppliers) && suppliers.map((s, idx) => (
                  <option key={s.address || idx} value={s.address} className="bg-slate-900 text-white">
                    {s.name || 'Unknown'} ({s.address ? `${s.address.slice(0, 6)}...${s.address.slice(-4)}` : 'No Address'})
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
            {loadingSuppliers && (
              <p className="text-[9px] text-blue-400 font-bold uppercase animate-pulse ml-1">Fetching authorized suppliers...</p>
            )}
          </div>

          {/* Gas Mode Toggle */}
          <div className="pt-2 border-t border-white/10">
            <div
              onClick={() => setIsGasless(!isGasless)}
              className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-[1.5rem] cursor-pointer transition-all border border-white/10 hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isGasless ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {isGasless ? <Zap size={20} fill="currentColor" /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Transaction Mode</p>
                  <p className="text-sm font-black text-white">{isGasless ? 'AI-Powered (Gasless)' : 'Direct (Self-paid Gas)'}</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isGasless ? 'bg-indigo-600' : 'bg-white/20'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isGasless ? 'right-1' : 'left-1'}`} />
              </div>
            </div>
            <p className="text-[9px] font-bold text-white/30 mt-2 px-2 leading-relaxed">
              {isGasless
                ? "AI will batch this transaction and pay for your Gas when fees are optimal."
                : "Transaction will be sent immediately. You will need to pay Gas via your wallet."}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isRelaying || status === 'success' || !selectedFile}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1 transition-all hover:brightness-110 hover:shadow-xl disabled:opacity-50 ${isGasless
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
              }`}
          >
            <div className="flex items-center gap-3">
              {(isLoading || isRelaying) ? (
                <><Loader2 size={18} className="animate-spin" /> {isRelaying ? 'AI Optimizing...' : 'Processing...'}</>
              ) : (
                <>
                  <Send size={18} />
                  {isGasless ? 'Submit Gasless' : 'Submit Direct'}
                </>
              )}
            </div>
            {(!isLoading && !isRelaying && status !== 'success') && (
              <span className="text-[9px] text-blue-200/70 font-bold tracking-tight">
                {isGasless ? 'AI-POWERED GASLESS TRANSACTION' : 'USER-PAID DIRECT TRANSACTION'}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );

};

export default CreateRequestModal;
