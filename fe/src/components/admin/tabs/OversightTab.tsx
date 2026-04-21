import React from 'react';
import { Loader2, Droplets } from 'lucide-react';
import type { CampaignRequest } from '../../../hooks/useAdmin';

interface OversightTabProps {
  approvedRequests: CampaignRequest[];
  processingId: string | null;
  onWithdrawGas: (addr: string) => Promise<void>;
}

const OversightTab: React.FC<OversightTabProps> = ({ approvedRequests, processingId, onWithdrawGas }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gas Monitoring</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Manage network fees and relayer sustainability</p>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          Reclaim funds to refill platform relayer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedRequests.map(campaign => (
          <div key={campaign.deployedAddress} className="bg-white border border-slate-200 p-8 rounded-[40px] group hover:border-blue-600/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/50">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-lg">{campaign.name}</p>
                <code className="text-[10px] font-mono font-bold text-slate-400 mt-2 block bg-slate-50 px-2 py-1 rounded border border-slate-100">{campaign.deployedAddress.slice(0, 18)}...</code>
              </div>
              <span className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Droplets size={20} />
              </span>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Network Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs font-black text-slate-900">Live Tracking</span>
                </div>
              </div>
              <button
                onClick={() => onWithdrawGas(campaign.deployedAddress)}
                disabled={!!processingId}
                className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-slate-900/10 uppercase tracking-widest active:scale-95"
              >
                {processingId === `gas-${campaign.deployedAddress}` ? <Loader2 size={14} className="animate-spin" /> : 'Reclaim Gas'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OversightTab;
