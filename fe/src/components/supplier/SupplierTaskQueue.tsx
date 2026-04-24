import React from 'react';
import { ClipboardList } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { SupplierTask } from '../../types/supplier';

interface SupplierTaskQueueProps {
  tasks: SupplierTask[];
  isLoading: boolean;
  onRefresh?: () => Promise<void>;
  uploadedEvidences: Record<string, string>;
  uploadingTaskId: string | null;
  onUpload: (campaignAddress: string, requestId: number) => void;
  onOpenIPFS: (hash: string) => void;
}

export const SupplierTaskQueue: React.FC<SupplierTaskQueueProps> = ({
  tasks,
  isLoading,
  uploadedEvidences,
  uploadingTaskId,
  onUpload,
  onOpenIPFS
}) => {
  const activeTasks = tasks.filter(t => !t.complete);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-xl transition-all hover:border-white/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-4">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Delivery Queue</h2>
            <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.2em]">Scanning network for active spending assignments.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-white/5 border-t-blue-500 rounded-full mb-6 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pulse">Querying chain state...</p>
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] py-24 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-900 to-blue-950 border border-white/10 rounded-3xl flex items-center justify-center mb-6 text-white/20 mx-auto shadow-2xl">
              <ClipboardList size={32} />
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">No active tasks</h3>
            <p className="text-white/40 max-w-xs mx-auto text-[11px] font-black uppercase tracking-[0.1em] leading-relaxed">
              Your wallet hasn't been mapped to any <br />
              <span className="text-blue-400">Pending requests</span> in the latest block range.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 px-2">
            {activeTasks.map(task => (
              <TaskCard
                key={`${task.campaignAddress}-${task.requestId}`}
                task={task}
                localCID={uploadedEvidences[`${task.campaignAddress}-${task.requestId}`]}
                uploadingTaskId={uploadingTaskId}
                onUpload={onUpload}
                onOpenIPFS={onOpenIPFS}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
