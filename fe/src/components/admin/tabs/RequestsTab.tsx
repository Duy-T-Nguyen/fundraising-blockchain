import React, { useState } from 'react';
import { CheckCircle2, Loader2, ExternalLink, Droplets, ChevronDown, ChevronUp, User, XCircle } from 'lucide-react';
import type { CampaignRequest } from '../../../hooks/useAdmin';

interface RequestsTabProps {
  requests: CampaignRequest[];
  processingId: string | null;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}

const CAT_NAMES = ['Education', 'Medical', 'Disaster', 'Environment', 'Others'];

const RequestsTab: React.FC<RequestsTabProps> = ({ requests, processingId, onApprove, onReject }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getImageUrl = (image?: string) => {
    if (!image) return null;
    return image.startsWith('ipfs://')
      ? `https://ipfs.io/ipfs/${image.replace('ipfs://', '')}`
      : image;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Campaign Requests</h2>
          <p className="text-white/40 text-sm font-medium mt-1">Verification queue for new fundraising initiatives</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-5 py-2.5 bg-blue-500/15 text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-blue-500/20">
            {requests.filter(r => r.status === 'PENDING').length} Pending
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        {requests.length === 0 ? (
          <div className="py-32 text-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[2.5rem] border-2 border-dashed border-white/10 shadow-xl">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Droplets className="text-white/20" size={40} />
            </div>
            <p className="text-white/30 font-black uppercase text-[10px] tracking-widest">No active requests found.</p>
          </div>
        ) : (
          [...requests]
            .sort((a, b) => b.id - a.id)
            .map((request) => {
            const isExpanded = expandedId === request.id;
            const imageUrl = getImageUrl(request.image);

            return (
              <div key={request.id}
                className={`bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[2.5rem] border transition-all duration-500 overflow-hidden shadow-xl shadow-blue-900/20 backdrop-blur-xl
                ${request.status === 'PENDING' ? 'border-white/10 hover:border-white/20' : 'border-white/5 opacity-60'}
                ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}`}>

                {/* Header / Clickable Area */}
                <div
                  onClick={() => toggleExpand(request.id)}
                  className="p-8 cursor-pointer flex items-center justify-between gap-8"
                >
                  <div className="flex items-center gap-8 flex-1 min-w-0">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Droplets className="text-white/20" size={28} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-white text-xl truncate tracking-tight">
                          {request.name || `Request #${request.id}`}
                        </h4>
                        {request.status === 'PENDING' && <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />}
                      </div>

                      <p className={`text-white/40 text-sm font-medium transition-all duration-300 ${isExpanded ? 'opacity-0 h-0' : 'opacity-100 line-clamp-1'}`}>
                        {request.description || 'Fetching description from IPFS...'}
                      </p>

                      {!isExpanded && (
                        <div className="flex items-center gap-4 mt-3 text-[9px] text-white/30 font-bold uppercase tracking-wider">
                          <span className="bg-white/5 px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                            <User size={10} /> {request.manager.slice(0, 6)}...{request.manager.slice(-4)}
                          </span>
                          <span>{CAT_NAMES[request.category] || 'Others'}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border
                            ${request.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              request.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            {request.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-white/10 transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 border-t border-white/10' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="p-8 pt-6">
                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Campaign Description</p>
                          <p className="text-white/60 text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                            {request.description || 'No description available.'}
                          </p>
                        </div>

                      </div>

                      <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-br from-[#0f172a] via-[#1e2d5a] to-[#0f172a] rounded-3xl border border-white/10 shadow-xl">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Financial Target</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{request.minimumContribution}</span>
                            <span className="text-white/40 font-bold text-sm">ETH (Min)</span>
                          </div>
                          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                            <span className="text-xs text-white/40 font-bold uppercase">Status</span>
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black rounded-lg border border-amber-500/20">
                              {request.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => onApprove(request.id)}
                                disabled={!!processingId}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-95"
                              >
                                {processingId === `approve-${request.id}` ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                Approve Campaign
                              </button>
                              <button
                                onClick={() => onReject(request.id)}
                                disabled={!!processingId}
                                className="w-full py-4 bg-white/5 hover:bg-red-500/15 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-white/50 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                              >
                                {processingId === `reject-${request.id}` ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                Reject Request
                              </button>
                            </>
                          )}

                          {request.deployedAddress && request.deployedAddress !== '0x0000000000000000000000000000000000000000' && (
                            <a
                              href={`/campaign/${request.deployedAddress}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-sm font-black rounded-2xl transition-all flex items-center justify-center gap-3 no-underline"
                            >
                              <ExternalLink size={18} />
                              View Campaign Page
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RequestsTab;
