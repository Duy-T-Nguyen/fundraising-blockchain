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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" onClick={onClose} />

      <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-lg relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-[1.5rem] flex items-center justify-center text-indigo-400 shadow-xl">
              <Signature size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Sign Protocol</h3>
              <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.3em]">Expert Certification Proof</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/20 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 pt-8">
          <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-7 mb-10 shadow-inner">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 border-b border-white/5 pb-2">Certification Payload:</div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-white/20 uppercase tracking-widest">Campaign</span>
                <span className="text-sm font-black text-white tracking-tight">{task.campaignName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-white/20 uppercase tracking-widest">Amount</span>
                <span className="text-sm font-black text-blue-400 tracking-tight">{task.value} <span className="text-[10px]">ETH</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-white/20 uppercase tracking-widest">Type</span>
                <span className="text-sm font-black text-indigo-400 tracking-tight">{task.isMultiStage ? 'Milestone Proof' : 'Final Delivery'}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/30 leading-relaxed mb-10 text-center italic font-medium">
            Protocol Notice: By signing this message, you cryptographically certify that the goods/services for this request have been delivered as described.
          </p>

          <button
            onClick={handleSign}
            disabled={isSigning}
            className="w-full py-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSigning ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <ShieldCheck size={24} />
                Authorize & Sign
              </>
            )}
          </button>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5">
          <p className="text-[9px] text-white/20 text-center font-black uppercase tracking-[0.2em]">
            This operation is gasless • Signature stored on-chain
          </p>
        </div>
      </div>
    </div>
  );
};
