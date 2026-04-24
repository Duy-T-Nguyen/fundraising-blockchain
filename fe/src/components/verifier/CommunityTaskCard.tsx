import React from 'react';
import { ThumbsUp, CheckCircle2, Users, MapPin } from 'lucide-react';
import type { VerifierTask } from '../../types/verifier';

interface CommunityTaskCardProps {
  task: VerifierTask;
  onApprove: (task: VerifierTask) => void;
}

export const CommunityTaskCard: React.FC<CommunityTaskCardProps> = ({ task, onApprove }) => {
  const isPending = task.status === 'PENDING';

  return (
    <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl transition-all group border-l-4 border-l-blue-500 hover:border-white/20 relative overflow-hidden">
      {/* Subtle Glow Ooze */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full group-hover:bg-blue-500/10 transition-colors" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              Community Validation Protocol
            </span>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
              <MapPin size={12} className="text-blue-400/50" /> {task.campaignName}
            </span>
          </div>

          <h4 className="text-2xl font-black text-white mb-3 truncate max-w-md tracking-tight group-hover:text-blue-400 transition-colors">{task.description}</h4>

          <p className="text-white/40 text-[13px] mb-5 font-medium max-w-lg leading-relaxed lowercase italic opacity-80">
            Protocol selection: you were randomly assigned as a validation node for this spending cycle.
          </p>

          <div className="text-[11px] font-black text-white tracking-widest bg-white/5 py-2 px-4 rounded-xl border border-white/5 w-fit">
            ALLOCATION: <span className="text-blue-400">{task.value} ETH</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPending ? (
            <button
              onClick={() => onApprove(task)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all shadow-2xl shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ThumbsUp size={18} />
              Approve Request
            </button>
          ) : (
            <div className="px-8 py-4 bg-emerald-500/10 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <CheckCircle2 size={18} className="animate-pulse" />
              Voted
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4 relative z-10 border-t border-white/5 pt-6">
        <div className="flex -space-x-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white/10 flex items-center justify-center shadow-2xl">
              <Users size={12} className="text-white/20" />
            </div>
          ))}
        </div>
        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Validation Cluster: 3 Nodes Selected</span>
      </div>
    </div>
  );
};
