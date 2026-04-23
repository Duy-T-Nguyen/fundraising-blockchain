import React from 'react';
import type { SupplierTask } from '../../types/supplier';
import { getIPFSUrl } from '../../utils/ipfs';
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
  Loader2,
  FileSearch
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
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all group overflow-hidden relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 relative z-10">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
              Req #{task.requestId}
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <MapPin size={12} />
              <span className="font-mono">{task.campaignAddress.slice(0, 10)}...{task.campaignAddress.slice(-4)}</span>
            </div>
            
            {/* Status Badge */}
            {task.complete ? (
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                <CheckCircle2 size={10} /> Funds Released
              </div>
            ) : localCID ? (
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1.5">
                <ShieldCheck size={10} /> Awaiting Verification
              </div>
            ) : (
              <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1.5">
                <Clock size={10} /> Action Required
              </div>
            )}
          </div>
          <h3 className="text-xl font-black text-slate-900">{task.description}</h3>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-3xl font-black text-slate-900">{task.value} <span className="text-sm font-medium text-slate-400 uppercase">ETH</span></div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {task.complete ? 'Successfully Settled' : 'Awaiting Settlement'}
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="mb-8 px-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-50 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-blue-600 -translate-y-1/2 z-0 transition-all duration-1000" 
            style={{ width: task.complete ? '100%' : localCID ? '50%' : '0%' }}
          />
          
          {[
            { label: 'Evidence', done: !!localCID || task.complete },
            { label: 'Verification', done: task.complete, active: !!localCID && !task.complete },
            { label: 'Settlement', done: task.complete }
          ].map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-white ${step.done ? 'bg-blue-600' : step.active ? 'bg-blue-400 animate-pulse' : 'bg-slate-100'}`}>
                {step.done && <Check size={10} className="text-white" />}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter ${step.done || step.active ? 'text-blue-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-50 relative z-10">
        {/* Slot 1: Manager's Notice */}
        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 block">Manager's Initial Notice</label>
          <div className="relative group/preview overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-100 aspect-video flex items-center justify-center cursor-pointer" onClick={() => task.evidenceHash && onOpenIPFS(task.evidenceHash)}>
            {task.evidenceHash ? (
              <>
                <img 
                  src={getIPFSUrl(task.evidenceHash)} 
                  alt="Instruction" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110"
                  onError={(e) => {
                    (e.target as any).onerror = null;
                    (e.target as any).src = 'https://placehold.co/600x400/f8fafc/94a3b8?text=Document+Preview';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/0 group-hover/preview:bg-slate-900/20 transition-all flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-4 group-hover/preview:opacity-100 group-hover/preview:translate-y-0 transition-all duration-300">
                    <ExternalLink size={14} className="text-slate-600" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-300">
                <FileSearch size={24} />
                <span className="text-[9px] font-bold uppercase italic">No Document</span>
              </div>
            )}
          </div>
        </div>

        {/* Slot 2: Supplier's Evidence */}
        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase text-blue-600/80 tracking-widest ml-1 block">Your Delivery Proof</label>
          <div className={`relative group/preview overflow-hidden rounded-[2rem] aspect-video flex items-center justify-center cursor-pointer border transition-all ${localCID ? 'bg-blue-50 border-blue-100' : 'bg-slate-50/30 border-dashed border-slate-200'}`} onClick={() => localCID && onOpenIPFS(localCID)}>
            {localCID ? (
              <>
                <img 
                  src={getIPFSUrl(localCID)} 
                  alt="Proof" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110"
                  onError={(e) => {
                    (e.target as any).onerror = null;
                    (e.target as any).src = 'https://placehold.co/600x400/eff6ff/3b82f6?text=Proof+Preview';
                  }}
                />
                <div className="absolute inset-0 bg-blue-900/0 group-hover/preview:bg-blue-900/20 transition-all flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-4 group-hover/preview:opacity-100 group-hover/preview:translate-y-0 transition-all duration-300">
                    <ExternalLink size={14} className="text-blue-600" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-200">
                <UploadCloud size={24} />
                <span className="text-[9px] font-bold uppercase italic tracking-widest">Pending Upload</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center relative z-10">
        <button 
          onClick={() => onUpload(task.campaignAddress, task.requestId)}
          disabled={uploadingTaskId === taskKey}
          className={`flex-1 w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${localCID ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 hover:-translate-y-0.5'}`}
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
          <div className="sm:w-auto w-full px-6 py-5 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center flex items-center gap-2">
            <ShieldCheck size={14} /> In Review
          </div>
        )}
      </div>
    </div>
  );
};
