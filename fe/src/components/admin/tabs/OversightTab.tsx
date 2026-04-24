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
          <h2 className="text-3xl font-black text-white tracking-tight">Gas Monitoring</h2>
          <p className="text-white/40 text-sm font-medium mt-1">Manage network fees and relayer sustainability</p>
        </div>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          Reclaim funds to refill platform relayer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedRequests.map(campaign => (
          <div key={campaign.deployedAddress} className="bg-gradient-to-bl from-slate-900 via-[#0a2030] to-slate-900 border border-cyan-500/15 p-8 rounded-[2.5rem] group hover:border-cyan-500/30 transition-all duration-300 shadow-xl shadow-cyan-900/10 hover:shadow-2xl hover:shadow-cyan-900/20 backdrop-blur-xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="font-black text-white group-hover:text-cyan-300 transition-colors uppercase tracking-tight text-lg">{campaign.name}</p>
                <code className="text-[10px] font-mono font-bold text-white/30 mt-2 block bg-white/5 px-2 py-1 rounded border border-white/10">{campaign.deployedAddress.slice(0, 18)}...</code>
              </div>
              <span className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                <Droplets size={20} />
              </span>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">Network Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-white/70">Live Tracking</span>
                </div>
              </div>
              <button
                onClick={() => onWithdrawGas(campaign.deployedAddress)}
                disabled={!!processingId}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest active:scale-95 disabled:opacity-50"
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
