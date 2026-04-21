import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useUserActivity } from '../hooks/useUserActivity';
import { ShieldCheck, ArrowLeft, TrendingUp, Layout, Settings, ExternalLink, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { slugify } from '../utils/slugify';

const CreatorDashboard: React.FC = () => {
  const { address } = useWallet();
  const { managedCampaigns, isLoading } = useUserActivity(address as `0x${string}`);

  // Fallback images for premium look while real IPFS images are not available
  const getPlaceholderImage = (ca: string) => {
    if (!ca) return 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop';
    const lastChar = ca.slice(-1).toLowerCase();
    const index = parseInt(lastChar, 16) % 5;
    const placeholders = [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop', // Charity
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop', // Education
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop', // Medical
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop', // Disaster
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop', // Environment
    ];
    return placeholders[index];
  };

  const getCampaignImage = (camp: any) => {
    if (camp.imageHash && camp.imageHash !== 'ipfs://placeholder' && camp.imageHash !== '') {
      return `https://gateway.pinata.cloud/ipfs/${camp.imageHash.replace('ipfs://', '')}`;
    }
    return getPlaceholderImage(camp.address);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 lg:px-12 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl text-white transition-all shadow-lg">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Creator Dashboard</h1>
              <p className="text-emerald-600 font-black tracking-[0.2em] uppercase text-[10px] mt-1 flex items-center gap-2">
                <ShieldCheck size={14} strokeWidth={3} /> Campaign Management / Ownership
              </p>
            </div>
          </div>

          <Link
            to="/campaigns/create"
            className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-1"
          >
            <PlusCircle size={20} />
            Launch New Project
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col justify-between shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <Layout className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Campaigns</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{managedCampaigns.filter(c => c.active).length} Projects</p>
            </div>
          </div>
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col justify-between shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Managed Projects</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{managedCampaigns.length} Total</p>
            </div>
          </div>
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col justify-between shadow-sm border-dashed border-2">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <Settings size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Ownership Status</p>
              <p className="text-xl font-black text-slate-600 mt-1">Verified Manager</p>
            </div>
          </div>
        </div>

        {/* Managed Projects List */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[3rem] blur opacity-15"></div>
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/50">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Your Projects</h2>
              <div className="px-5 py-2 bg-emerald-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                On-Chain Verified
              </div>
            </div>

            <div className="p-8">
              {isLoading ? (
                <div className="py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest">Querying blockchain for your projects...</div>
              ) : managedCampaigns.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Layout size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">No campaigns found</h3>
                    <p className="text-slate-500 text-sm mt-2">You haven't created any campaigns with this wallet yet.</p>
                  </div>
                  <Link
                    to="/campaigns/create"
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
                  >
                    Create Your First Campaign
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {managedCampaigns.map((camp) => (
                    <div key={camp.address} className="rounded-[2.5rem] bg-white border border-slate-100 hover:border-emerald-500 transition-all duration-300 group/card shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 overflow-hidden flex flex-col no-underline">
                      {/* Image Top Section */}
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={getCampaignImage(camp)}
                          alt={camp.name}
                          className="w-full h-full object-cover grayscale-[0.2] group-hover/card:scale-110 group-hover/card:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute top-6 left-6">
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${camp.active ? 'bg-emerald-500/90 text-white' : 'bg-slate-800/90 text-slate-300'}`}>
                            {camp.active ? '● Active' : '○ Inactive'}
                          </div>
                        </div>
                        <Link
                          to={`/campaign/${slugify(camp.name)}`}
                          className="absolute top-6 right-6 p-2 bg-white/90 backdrop-blur-md rounded-xl text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                        >
                          <ExternalLink size={18} />
                        </Link>
                      </div>

                      {/* Content Section */}
                      <div className="p-8 flex flex-col flex-1">
                        <h4 className="text-2xl font-black text-slate-900 mb-4 truncate">{camp.name}</h4>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-4 border-t border-slate-50">
                            <div>
                              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Balance</p>
                              <p className="text-lg font-black text-emerald-600">{camp.balance} ETH</p>
                            </div>
                            <div className="text-right text-transparent">Action</div>
                          </div>

                          <div className="flex justify-between items-center py-4 border-t border-slate-50">
                            <div>
                              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Contract Address</p>
                              <p className="text-slate-900 font-mono text-[11px] bg-slate-50 px-3 py-1.5 rounded-lg mt-1">
                                {camp.address.substring(0, 10)}...{camp.address.substring(34)}
                              </p>
                            </div>
                          </div>

                          <Link
                            to={`/campaign/${slugify(camp.name)}`}
                            className="w-full py-4 mt-2 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/10 group-hover/card:shadow-blue-600/20"
                          >
                            <Settings size={18} />
                            Manage Project
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
