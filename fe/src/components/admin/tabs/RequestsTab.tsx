import React, { useState } from 'react';
import { CheckCircle2, Loader2, ExternalLink, Droplets, ChevronDown, ChevronUp, User } from 'lucide-react';
import type { CampaignRequest } from '../../../hooks/useAdmin';

interface RequestsTabProps {
  requests: CampaignRequest[];
  processingId: string | null;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}

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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Campaign Requests</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Verification queue for new fundraising initiatives</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-5 py-2.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-blue-100 shadow-sm">
            {requests.filter(r => r.status === 'PENDING').length} Pending
          </span>
        </div>
      </div>
      
      <div className="grid gap-6">
        {requests.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Droplets className="text-slate-200" size={40} />
            </div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No active requests found.</p>
          </div>
        ) : (
          requests.map((request) => {
            const isExpanded = expandedId === request.id;
            const imageUrl = getImageUrl(request.image);

            return (
              <div key={request.id} 
                className={`bg-white rounded-[40px] border transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50
                ${request.status === 'PENDING' ? 'border-slate-200' : 'border-slate-100 opacity-60'}
                ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}`}>
                
                {/* Header / Clickable Area */}
                <div 
                  onClick={() => toggleExpand(request.id)}
                  className="p-8 cursor-pointer flex items-center justify-between gap-8"
                >
                  <div className="flex items-center gap-8 flex-1 min-w-0">
                    <div className="w-20 h-20 rounded-[28px] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Droplets className="text-slate-300" size={28} />
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-slate-900 text-xl truncate tracking-tight">
                          {request.name || `Request #${request.id}`}
                        </h4>
                        {request.status === 'PENDING' && <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>}
                      </div>
                      
                      {/* 1-line description preview */}
                      <p className={`text-slate-500 text-sm font-medium transition-all duration-300 ${isExpanded ? 'opacity-0 h-0' : 'opacity-100 line-clamp-1'}`}>
                        {request.description || 'Fetching description from IPFS...'}
                      </p>
                      
                      {!isExpanded && (
                        <div className="flex items-center gap-4 mt-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1.5">
                             <User size={10} /> {request.manager.slice(0,6)}...{request.manager.slice(-4)}
                          </span>
                          <span>Category {request.category}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 border-t border-slate-50' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="p-8 pt-6">
                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Campaign Description</p>
                          <p className="text-slate-600 text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                            {request.description || 'No description available.'}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Manager Address</p>
                            <p className="text-slate-700 font-mono text-xs truncate">{request.manager}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Metadata CID</p>
                            <p className="text-slate-700 font-mono text-xs truncate">{request.metadataCID}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                         <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Financial Target</p>
                            <div className="flex items-baseline gap-2">
                               <span className="text-3xl font-black">{request.minimumContribution}</span>
                               <span className="text-slate-400 font-bold text-sm">ETH (Min)</span>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                               <span className="text-xs text-slate-400 font-bold uppercase">Status</span>
                               <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-black rounded-lg">
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
                                 className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95"
                               >
                                 {processingId === `approve-${request.id}` ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                 Approve Campaign
                               </button>
                               <button 
                                 onClick={() => onReject(request.id)}
                                 disabled={!!processingId}
                                 className="w-full py-4 bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-500 font-black rounded-2xl transition-all active:scale-95"
                               >
                                 {processingId === `reject-${request.id}` ? <Loader2 size={18} className="animate-spin" /> : 'Reject Request'}
                               </button>
                             </>
                           )}
                           
                           {request.deployedAddress && request.deployedAddress !== '0x0000000000000000000000000000000000000000' && (
                             <a 
                               href={`/campaign/${request.deployedAddress}`} 
                               target="_blank" 
                               rel="noreferrer"
                               className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black rounded-2xl transition-all flex items-center justify-center gap-3 no-underline"
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
