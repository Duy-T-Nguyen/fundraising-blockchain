import React from 'react';
import SpendingRequestCard from './SpendingRequestCard';
import type { SpendingRequest } from '../../types/campaigndetail';
import { LayoutGrid } from 'lucide-react';

interface SpendingRequestsProps {
  requests: SpendingRequest[];
}

const SpendingRequests: React.FC<SpendingRequestsProps> = ({ requests }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-tl from-slate-900 via-[#120e38] to-slate-900 rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-900/20 p-8">
      {/* Decorative blobs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
            <LayoutGrid size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Governance</p>
            <h2 className="text-lg font-black text-white uppercase tracking-wide">Spending Requests</h2>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest">
          {requests.length} Requests
        </div>
      </div>

      {/* Content */}
      <div className="relative space-y-4">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 border-2 border-dashed border-white/10 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 border border-white/10">
              <LayoutGrid size={24} />
            </div>
            <div className="text-center">
              <p className="text-white/60 font-bold text-sm">No active requests found</p>
              <p className="text-white/30 text-xs mt-1">The manager hasn't created any spending requests yet.</p>
            </div>
          </div>
        ) : (
          requests.map((req) => (
            <SpendingRequestCard key={req.id} request={req} />
          ))
        )}
      </div>
    </div>
  );
};

export default SpendingRequests;
