import React from 'react';
import type { SupplierTask } from '../../types/supplier';
import {
  MapPin,
  Globe,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Check,
  ExternalLink,
  UploadCloud,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface TaskCardProps {
  task: SupplierTask;
  localCID: string | undefined;
  uploadingTaskId: string | null;
  onUpload: (campaignAddress: string, requestId: number) => void;
  onOpenIPFS: (hash: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  localCID,
  uploadingTaskId,
  onUpload,
  onOpenIPFS
}) => {
  const taskKey = `${task.campaignAddress}-${task.requestId}`;

  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-[2.5rem] p-8 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group overflow-hidden relative backdrop-blur-3xl">
      {/* Decorative Ooze */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 relative z-10">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1 bg-white/5 text-white/40 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-white/10">
              Req #{task.requestId}
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
              <MapPin size={12} />
              <span className="font-mono tracking-tighter">{task.campaignAddress.slice(0, 10)}...{task.campaignAddress.slice(-4)}</span>
            </div>

            {/* Status Badge */}
            {task.complete ? (
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                <CheckCircle2 size={10} /> Funds Released
              </div>
            ) : localCID ? (
              <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                <ShieldCheck size={10} /> Awaiting Verification
              </div>
            ) : (
              <div className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-amber-500/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                <Clock size={10} /> Action Required
              </div>
            )}
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">{task.description}</h3>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-3xl font-black text-white tracking-tighter leading-none">{task.value} <span className="text-xs font-black text-blue-400/60 uppercase tracking-widest ml-1">ETH</span></div>
          <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
            {task.complete ? 'Successfully Settled' : 'Awaiting Settlement'}
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="mb-10 px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-blue-600 to-indigo-600 -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ width: task.complete ? '100%' : localCID ? '50%' : '0%' }}
          />

          {[
            { label: 'Evidence', done: !!localCID || task.complete },
            { label: 'Verification', done: task.complete, active: !!localCID && !task.complete },
            { label: 'Settlement', done: task.complete }
          ].map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 border-[3px] ${step.done ? 'bg-blue-600 border-blue-400/30' : step.active ? 'bg-blue-500 border-blue-400/50 animate-pulse' : 'bg-slate-900 border-white/5'}`}>
                {step.done && <Check size={12} className="text-white" />}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${step.done || step.active ? 'text-blue-400' : 'text-white/20'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-10 border-t border-white/5 relative z-10">
        {/* Slot 1: Manager's Notice */}
        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em] ml-2 block italic">Manager's Initial Notice</label>
          <button
            onClick={() => onOpenIPFS(task.evidenceHash)}
            className="w-full flex items-center justify-between gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-[11px] text-white/50 font-mono hover:bg-white/10 transition-all group/link"
          >
            <div className="flex items-center gap-3 truncate">
              < Globe size={14} className="text-white/20 group-hover/link:text-blue-400 transition-colors" />
              <span className="truncate tracking-tight">{task.evidenceHash || 'No initial hash'}</span>
            </div>
            <ExternalLink size={12} className="text-white/10 group-hover/link:text-blue-400 transition-colors" />
          </button>
        </div>

        {/* Slot 2: Supplier's Evidence */}
        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase text-blue-400/80 tracking-[0.3em] ml-2 block italic font-serif">Your Delivery Proof</label>
          <button
            onClick={() => localCID && onOpenIPFS(localCID)}
            disabled={!localCID}
            className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${localCID ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 group/link' : 'bg-white/[0.02] border-white/5 text-white/20 font-mono italic cursor-default'}`}
          >
            <div className="flex items-center gap-3 truncate">
              {localCID ? <CheckCircle2 size={14} className="animate-pulse" /> : < Globe size={14} className="text-white/5" />}
              <span className="text-[11px] font-black tracking-tight truncate">
                {localCID ? `ipfs://${localCID}` : 'Not yet uploaded'}
              </span>
            </div>
            {localCID && <ExternalLink size={12} className="text-blue-400/30 group-hover/link:text-blue-400 transition-colors" />}
          </button>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center relative z-10">
        <button
          onClick={() => onUpload(task.campaignAddress, task.requestId)}
          disabled={uploadingTaskId === taskKey}
          className={`flex-1 w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-300 ${localCID ? 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/20 hover:-translate-y-0.5'}`}
        >
          {uploadingTaskId === taskKey ? (
            <><Loader2 size={18} className="animate-spin" /> Processing...</>
          ) : localCID ? (
            <><RefreshCw size={18} /> Update Proof</>
          ) : (
            <><UploadCloud size={18} /> Submit Evidence</>
          )}
        </button>

        {localCID && !task.complete && (
          <div className="sm:w-auto w-full px-8 py-5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-center flex items-center gap-3 shadow-xl">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            In Review
          </div>
        )}
      </div>
    </div>
  );
};
