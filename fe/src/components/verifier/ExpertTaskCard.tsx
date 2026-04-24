import React from 'react';
import { ExternalLink, ShieldCheck, Signature, MapPin } from 'lucide-react';
import type { VerifierTask } from '../../types/verifier';

interface ExpertTaskCardProps {
  task: VerifierTask;
  onVerify: (task: VerifierTask) => void;
  onReject: (task: VerifierTask) => void;
  onOpenIPFS: (hash: string) => void;
}

export const ExpertTaskCard: React.FC<ExpertTaskCardProps> = ({ task, onVerify, onReject, onOpenIPFS }) => {
  const isPending = task.status === 'PENDING';

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/30 transition-all group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
              Expert Verification
            </span>
          </div>
          
          <h4 className="text-xl font-black text-slate-900 mb-2 truncate max-w-md">{task.description}</h4>
          
          <div className="flex items-center gap-4 text-slate-400">
            <div className="text-[11px] font-bold flex items-center gap-2">
              <span className="text-slate-900">{task.value} ETH</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <span>Recipient: {task.recipient.slice(0, 6)}...{task.recipient.slice(-4)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onOpenIPFS(task.evidenceHash)}
            className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl transition-all flex items-center gap-2"
            title="View Evidence on IPFS"
          >
            <ExternalLink size={18} />
            <span className="text-[10px] font-bold uppercase">Evidence</span>
          </button>
          
          {isPending ? (
            <div className="flex gap-2">
              <button 
                onClick={() => onVerify(task)}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5"
              >
                <ShieldCheck size={18} />
                Approve Proof
              </button>
              <button 
                onClick={() => onReject(task)}
                className="px-4 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-emerald-100">
              <ShieldCheck size={18} />
              Verified
            </div>
          )}
        </div>
      </div>

      {task.isMultiStage && (
        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Milestone Progress</div>
          <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-1000" 
              style={{ width: `${((task.milestoneIndex || 0) + 1) * 20}%` }} 
            />
          </div>
          <div className="text-[10px] font-black text-indigo-600">Step {task.milestoneIndex !== undefined ? task.milestoneIndex + 1 : 1}</div>
        </div>
      )}
    </div>
  );
};
