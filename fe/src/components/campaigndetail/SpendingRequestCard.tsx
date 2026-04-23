import React from 'react';
import type { SpendingRequest } from '../../types/campaigndetail';
import { Coins, FileText, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface SpendingRequestCardProps {
  request: SpendingRequest;
}

const SpendingRequestCard: React.FC<SpendingRequestCardProps> = ({ request }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all group">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        {/* Left: Info */}
        <div className="space-y-3 flex-grow">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Request #{request.id}</span>
          </div>
          <h4 className="text-base font-black text-white leading-tight">
            {request.title}
          </h4>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Coins size={13} className="text-amber-400" />
              <span className="text-[11px] font-black text-amber-300">{request.amount} ETH</span>
            </div>
            {request.description && (
              <div className="flex items-center gap-2 text-white/40">
                <FileText size={12} />
                <span className="text-[11px] font-medium italic">{request.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex sm:flex-col gap-2 sm:min-w-[140px]">
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 font-black py-2 px-3 rounded-xl transition-all text-xs">
              <CheckCircle size={13} />
              Approve
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-black py-2 px-3 rounded-xl transition-all text-xs">
              <XCircle size={13} />
              Reject
            </button>
          </div>
          <button className="w-full flex items-center justify-center gap-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/20 text-blue-400 font-black py-2 px-3 rounded-xl transition-all text-xs">
            <ExternalLink size={13} />
            View Proposal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpendingRequestCard;
