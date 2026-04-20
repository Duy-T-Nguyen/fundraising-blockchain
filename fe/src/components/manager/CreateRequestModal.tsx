import React, { useState } from 'react';
import { publicClient } from '../../blockchain/client';
import { ABIS } from '../../blockchain/constants';
import { encodeFunctionData, parseEther } from 'viem';
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreateRequestModalProps {
  address: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ address, onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [recipient, setRecipient] = useState('');
  const [evidenceHash, setEvidenceHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.ethereum) return;

    setIsLoading(true);
    setStatus('pending');
    setErrorMessage('');

    try {
      // 1. Prepare transaction
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const userAccount = accounts[0];

      // 2. Encode function data
      const data = encodeFunctionData({
        abi: ABIS.CAMPAIGN,
        functionName: 'createRequest',
        args: [description, parseEther(value), recipient, evidenceHash || ''],
      });

      // 3. Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAccount,
          to: address,
          data: data,
        }],
      });

      console.log('Transaction sent:', txHash);
      
      // 4. Wait for receipt
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

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Purpose / Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will these funds be used for?"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none h-24 font-medium text-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Evidence (Optional)</label>
              <input
                type="text"
                value={evidenceHash}
                onChange={(e) => setEvidenceHash(e.target.value)}
                placeholder="IPFS Hash"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recipient Address</label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-xs font-bold text-blue-600"
            />
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
            disabled={isLoading || status === 'success'}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all hover:shadow-xl hover:shadow-black/10 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
