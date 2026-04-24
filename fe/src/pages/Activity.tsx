import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useUserActivity } from '../hooks/useUserActivity';
import { ShieldCheck, Heart, Coins, ExternalLink, ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';


const Activity: React.FC = () => {
  const { address } = useWallet();
  const { userDonations, isLoading } = useUserActivity(address as `0x${string}`);

  const uniqueCampaignsSupported = new Set(userDonations.map(d => d.campaignAddress.toLowerCase())).size;

  return (
    <div
      className="min-h-screen pt-24 pb-20 px-4 lg:px-12"
      style={{ background: 'linear-gradient(180deg, #0b1628 0%, #112044 20%, #1e3464 50%, #0b1628 100%)' }}
    >
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <Link to="/" className="p-4 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center text-white/40 hover:text-white transition-all shadow-xl hover:bg-white/10">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">Your Activity Hub</h1>
              <p className="text-blue-400 font-black tracking-[0.25em] uppercase text-[10px] mt-2 flex items-center gap-2">
                <ShieldCheck size={14} strokeWidth={3} className="text-blue-400" />
                <span className="opacity-60">Dashboard</span>
                <span className="opacity-20">/</span>
                <span>Contribution History</span>
              </p>
            </div>
          </div>

          {/* Syncing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-500/10 rounded-[1.2rem] border border-blue-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Loader2 size={16} className="text-blue-400 animate-spin" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Scanning Blockchain...</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-white/10 rounded-[3rem] flex flex-col justify-between group hover:border-rose-500/30 transition-all duration-700 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Subtle Glow Ooze */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-rose-500/5 blur-[40px] rounded-full group-hover:bg-rose-500/10 transition-colors" />

            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
              <Heart className="text-rose-500" size={28} fill="currentColor" />
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Supported Campaigns</p>
              <p className="text-3xl font-black text-white tracking-tight">{uniqueCampaignsSupported} Categories</p>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-white/10 rounded-[3rem] flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-700 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Subtle Glow Ooze */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full group-hover:bg-amber-500/10 transition-colors" />

            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <Coins className="text-amber-500" size={28} />
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Aggregate Impact</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white tracking-tight">
                  {userDonations.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(4)}
                </p>
                <span className="text-xs font-black text-amber-500 uppercase tracking-widest">ETH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Major Glass Block - Donation History */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="p-8 px-10 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-black text-white tracking-[0.2em] uppercase">Donation History</h2>
              <div className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white text-[9px] font-black uppercase tracking-[0.3em] shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                Blockchain Verified
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="py-6 px-10 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Project Identity</th>
                    <th className="py-6 px-10 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Contribution</th>
                    <th className="py-6 px-10 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Timestamp</th>
                    <th className="py-6 px-10 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {userDonations.length > 0 ? (
                    userDonations.map((don, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-all duration-300 group/row">
                        <td className="py-8 px-10">
                          <Link
                            to={`/campaign/${don.campaignAddress}`}
                            className="font-black text-white text-base hover:text-blue-400 transition-all duration-300 tracking-tight flex flex-col"
                          >
                            <span>{don.campaignName}</span>
                            <span className="text-[10px] text-white/20 font-mono tracking-tighter uppercase mt-1">{don.campaignAddress.slice(0, 14)}...</span>
                          </Link>
                        </td>
                        <td className="py-8 px-10">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                              <Coins className="text-blue-400" size={16} />
                            </div>
                            <span className="font-black text-white text-lg tracking-tight">{don.amount} <span className="text-[10px] text-blue-400 uppercase tracking-widest ml-1">ETH</span></span>
                          </div>
                        </td>
                        <td className="py-8 px-10">
                          <div className="flex items-center gap-2.5 text-white/40 font-black text-[10px] bg-white/5 px-4 py-2 rounded-xl w-fit border border-white/5 group-hover/row:border-white/10 group-hover/row:text-white/60 transition-all uppercase tracking-widest">
                            <Calendar size={14} className="opacity-50" />
                            {don.timestamp}
                          </div>
                        </td>
                        <td className="py-8 px-10 text-right">
                          <a
                            href={`https://sepolia.etherscan.io/address/${don.campaignAddress}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 rounded-[1.2rem] text-white/20 transition-all inline-block border border-white/5 hover:border-blue-500/30"
                          >
                            <ExternalLink size={20} />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-32 text-center text-white/20 font-black animate-pulse uppercase tracking-[0.4em] text-[10px]">Scanning decentralized network...</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-32 text-center px-10">
                        <div className="border-2 border-dashed border-white/5 rounded-[3rem] py-20 bg-white/[0.01]">
                          <p className="text-white/20 font-black uppercase tracking-[0.2em] text-sm">No activity records synchronized.</p>
                          <p className="text-white/10 text-[10px] mt-3 font-black uppercase tracking-widest italic">Connect an active wallet with contribution history.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
