import React, { useState } from 'react';
import { X, Signature, ShieldCheck, Loader2 } from 'lucide-react';
import type { VerifierTask } from '../../types/verifier';
import { hashVerificationMessage } from '../../utils/signatures';
import { getWalletClient } from '../../blockchain/client';
import { useNotification } from '../../context/NotificationContext';

interface SignatureModalProps {
  task: VerifierTask | null;
  onClose: () => void;
  onSuccess: (signature: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ task, onClose, onSuccess }) => {
  const [isSigning, setIsSigning] = useState(false);
  const toast = useNotification();

  if (!task) return null;

  const handleSign = async () => {
    setIsSigning(true);
    setError(null);

    try {
      const walletClient = await getWalletClient();
      if (!walletClient) throw new Error('Wallet not connected');

      const [address] = await walletClient.getAddresses();

      const messageHash = hashVerificationMessage(
        task.campaignAddress,
        task.requestIndex,
        task.milestoneIndex
      );

      const signature = await walletClient.signMessage({
        account: address,
        message: { raw: messageHash }
      });

      onSuccess(signature);
    } catch (err: any) {
      console.error('Signing failed:', err);
      toast.error(err.message || 'Verification signing failed');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />

      <div className="bg-white rounded-[3rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Signature size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Sign Verification</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expert Certification Proof</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-slate-50 rounded-3xl p-6 mb-8">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">You are certifying:</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Campaign</span>
                <span className="text-xs font-bold text-slate-900">{task.campaignName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Amount</span>
                <span className="text-xs font-bold text-slate-900">{task.value} ETH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Type</span>
                <span className="text-xs font-bold text-slate-900">{task.isMultiStage ? 'Milestone Proof' : 'Final Delivery'}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-8 text-center italic">
            By signing this message, you cryptographically certify that the goods/services for this request have been delivered as described in the evidence.
          </p>



          <button
            onClick={handleSign}
            disabled={isSigning}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-200"
          >
            {isSigning ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                Authorize & Sign
              </>
            )}
          </button>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-tighter">
            This operation does not consume Gas. It is a signature only.
          </p>
        </div>
      </div>
    </div>
  );
};
