import React from 'react';
import { Wallet, CheckCircle2, Loader2, ExternalLink, Droplets } from 'lucide-react';
import type { CampaignRequest } from '../../../hooks/useAdmin';

interface RequestsTabProps {
  requests: CampaignRequest[];
  processingId: string | null;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}

const RequestsTab: React.FC<RequestsTabProps> = ({ requests, processingId, onApprove, onReject }) => {
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
          requests.map((request) => (
            <div key={request.id} className={`p-8 bg-white rounded-[40px] border transition-all duration-300 flex items-center justify-between gap-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50
              ${request.status === 'PENDING' ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-center gap-8 flex-1 min-w-0">
                <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group">
                  {request.imageHash ? (
                    <img src={`https://ipfs.io/ipfs/${request.imageHash.replace('ipfs://', '')}`} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="" />
                  ) : (
                    <Droplets className="text-slate-300" size={32} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-black text-slate-900 text-2xl truncate tracking-tight">{request.name}</h4>
                    {request.status === 'PENDING' && <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50"></span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-slate-500">
                      <Wallet size={14} className="text-slate-300"/> {request.manager.slice(0,6)}...{request.manager.slice(-4)}
                    </span>
                    <span className="flex items-center gap-2">Category — <span className="text-slate-700">{request.category}</span></span>
                    <span className="text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50">Min Contrib: {request.minimumContribution} ETH</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {request.status === 'PENDING' ? (
                  <>
                    <button 
                      onClick={() => onApprove(request.id)}
                      disabled={!!processingId}
                      className="px-8 py-4 bg-slate-900 hover:bg-black text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-slate-900/20 flex items-center gap-3 active:scale-95"
                    >
                      {processingId === `approve-${request.id}` ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      Approve
                    </button>
                    <button 
                      onClick={() => onReject(request.id)}
                      disabled={!!processingId}
                      className="px-8 py-4 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-100 text-slate-500 font-black rounded-2xl transition-all active:scale-95"
                    >
                      {processingId === `reject-${request.id}` ? <Loader2 size={18} className="animate-spin" /> : 'Reject'}
                    </button>
                  </>
                ) : (
                  <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border
                    ${request.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {request.status}
                  </div>
                )}
                {request.deployedAddress && request.deployedAddress !== '0x0000000000000000000000000000000000000000' && (
                  <a 
                    href={`/campaign/${request.deployedAddress}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-4 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-200 shadow-sm hover:shadow active:scale-90"
                  >
                    <ExternalLink size={24} className="text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RequestsTab;
