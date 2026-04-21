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
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Delivery Queue</h2>
            <p className="text-slate-500 text-sm font-medium">Scanning network for active spending assignments.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-slate-100 border-t-blue-600 rounded-full mb-6" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying chain state...</p>
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[3rem] py-24 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 text-slate-200 mx-auto shadow-sm">
              <ClipboardList size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No active tasks</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm">Your wallet hasn't been mapped to any pending requests in the latest block range.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
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
