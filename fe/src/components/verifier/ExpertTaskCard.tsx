import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
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
    <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl transition-all group hover:border-white/20 relative overflow-hidden">
      {/* Decorative Ooze */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              Expert Verification Protocol
            </span>
          </div>

          <h4 className="text-2xl font-black text-white mb-3 truncate max-w-md tracking-tight group-hover:text-indigo-400 transition-colors duration-300">{task.description}</h4>

          <div className="flex items-center gap-5">
            <div className="text-[11px] font-black flex items-center gap-2">
              <span className="text-white tracking-widest">{task.value} <span className="text-indigo-400 text-[10px]">ETH</span></span>
              <span className="w-1 h-1 bg-white/10 rounded-full" />
              <span className="text-white/30 lowercase font-mono">rcpt: {task.recipient.slice(0, 10)}...</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onOpenIPFS(task.evidenceHash)}
            className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all flex items-center gap-3 border border-white/5 active:scale-95"
            title="View Evidence on IPFS"
          >
            <ExternalLink size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Evidence</span>
          </button>

          {isPending ? (
            <div className="flex gap-3">
              <button
                onClick={() => onVerify(task)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-3 transition-all shadow-2xl shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ShieldCheck size={18} />
                Approve Proof
              </button>
              <button
                onClick={() => onReject(task)}
                className="px-6 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="px-10 py-4 bg-emerald-500/10 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <ShieldCheck size={18} className="animate-pulse" />
              Verified
            </div>
          )}
        </div>
      </div>

      {task.isMultiStage && (
        <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-6 relative z-10">
          <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Milestone Progress</div>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${((task.milestoneIndex || 0) + 1) * 20}%` }}
            />
          </div>
          <div className="text-[10px] font-black text-indigo-400 tracking-tighter">PHASE {task.milestoneIndex !== undefined ? task.milestoneIndex + 1 : 1}</div>
        </div>
      )}
    </div>
  );
};
