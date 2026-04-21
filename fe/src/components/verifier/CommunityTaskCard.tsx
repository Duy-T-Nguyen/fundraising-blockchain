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
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/30 transition-all group border-l-4 border-l-blue-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100">
              Community Validation
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
              <MapPin size={12} /> {task.campaignName}
            </span>
          </div>
          
          <h4 className="text-xl font-black text-slate-900 mb-2 truncate max-w-md">{task.description}</h4>
          
          <p className="text-slate-400 text-xs mb-4">
            You were randomly selected as a validator for this micro-spending request.
          </p>
          
          <div className="text-[11px] font-bold text-slate-900">
            Value: {task.value} ETH
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPending ? (
            <button 
              onClick={() => onApprove(task)}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5"
            >
              <ThumbsUp size={18} />
              Approve Request
            </button>
          ) : (
            <div className="px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-emerald-100">
              <CheckCircle2 size={18} />
              Voted
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-2">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
              <Users size={10} className="text-slate-400" />
            </div>
          ))}
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">3 Random Validators Selected</span>
      </div>
    </div>
  );
};
