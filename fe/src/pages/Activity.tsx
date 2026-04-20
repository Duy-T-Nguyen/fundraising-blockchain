import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useUserActivity } from '../hooks/useUserActivity';
import { ShieldCheck, Heart, Coins, ExternalLink, ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { slugify } from '../utils/slugify';

const Activity: React.FC = () => {
  const { address } = useWallet();
  const { userDonations, isLoading } = useUserActivity(address as `0x${string}`);

  const uniqueCampaignsSupported = new Set(userDonations.map(d => d.campaignAddress.toLowerCase())).size;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 lg:px-12 bg-[#f8fafc]">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl text-white transition-all shadow-lg">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Activity Hub</h1>
              <p className="text-blue-600 font-black tracking-[0.2em] uppercase text-[10px] mt-1 flex items-center gap-2">
                <ShieldCheck size={14} strokeWidth={3} /> Dashboard / Contribution History
              </p>
            </div>
          </div>
          
          {/* Subtle Syncing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
              <Loader2 size={16} className="text-blue-600 animate-spin" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Syncing Blockchain...</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col justify-between group hover:border-blue-500 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <Heart className="text-red-500" size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Supported Campaigns</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{uniqueCampaignsSupported} Categories</p>
            </div>
          </div>
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col justify-between group hover:border-blue-500 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
              <Coins className="text-amber-500" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Aggregate Impact</p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {userDonations.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(4)} ETH
              </p>
            </div>
          </div>
        </div>

        {/* Major Glass Block - Donation History */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/50">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Donation History</h2>
              <div className="px-5 py-2 bg-blue-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                Blockchain Verified
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100/50">
                    <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                    <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                    <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                    <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {userDonations.length > 0 ? (
                    userDonations.map((don, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="py-6 px-10">
                          <Link 
                            to={`/campaign/${slugify(don.campaignName)}`}
                            className="font-extrabold text-slate-900 text-sm hover:text-blue-600 transition-all duration-300"
                          >
                            {don.campaignName}
                          </Link>
                        </td>
                        <td className="py-6 px-10">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Coins className="text-blue-600" size={14} />
                            </div>
                            <span className="font-black text-slate-900">{don.amount} ETH</span>
                          </div>
                        </td>
                        <td className="py-6 px-10">
                          <div className="flex items-center gap-2 text-slate-600 font-bold text-xs bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                            <Calendar size={12} />
                            {don.timestamp}
                          </div>
                        </td>
                        <td className="py-6 px-10 text-right">
                          <a 
                            href={`https://sepolia.etherscan.io/address/${don.campaignAddress}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 hover:bg-blue-600 hover:text-white rounded-xl text-blue-600 transition-all inline-block"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest">Scanning latest blockchain segments...</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic border-2 border-dashed border-slate-100 rounded-[2rem] m-4">No donation records found in recent blocks.</td>
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
