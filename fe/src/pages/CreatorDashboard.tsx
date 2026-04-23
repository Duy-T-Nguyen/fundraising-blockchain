import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useUserActivity } from '../hooks/useUserActivity';
import { ShieldCheck, ArrowLeft, TrendingUp, Layout, Settings, ExternalLink, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIRelayerStatus from '../components/common/AIRelayerStatus';

import { useCampaignsWithSummaries } from '../hooks/useCampaignsWithSummaries';

const CreatorDashboard: React.FC = () => {
  const { address } = useWallet();
  const { campaigns, isLoading: campaignsLoading } = useCampaignsWithSummaries();
  const { pendingRequests, isLoading: requestsLoading } = useUserActivity(address as `0x${string}`);

  // Filter campaigns where user is the manager
  const managedCampaigns = campaigns.filter(
    c => c.manager?.toLowerCase() === address?.toLowerCase()
  );

  const isLoading = campaignsLoading || requestsLoading;

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

  // 1. Loading State
  if (isLoading && managedCampaigns.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(180deg, #0b1628 0%, #112044 20%, #1e3464 50%, #0b1628 100%)' }}
      >
        <div className="w-12 h-12 border-4 border-blue-500/40 border-t-blue-400 rounded-full animate-spin"></div>
        <p className="text-white/50 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Blockchain Data...</p>
      </div>
    );
  }

  // 2. Dashboard Layout
  return (
    <div
      className="min-h-screen pt-24 pb-20 px-4 lg:px-12"
      style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.98) 0%, rgba(17,32,68,0.95) 15%, rgba(30,52,100,0.9) 35%, rgba(17,32,68,0.95) 70%, rgba(11,22,40,0.98) 100%)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm rounded-2xl text-white transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Manager Dashboard</h1>
              <p className="text-emerald-400 font-black tracking-[0.2em] uppercase text-[10px] mt-1 flex items-center gap-2">
                <ShieldCheck size={14} strokeWidth={3} /> Campaign Management / Ownership
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AIRelayerStatus />
            <Link
              to="/campaigns/create"
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1"
            >
              <PlusCircle size={20} />
              Launch Project
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 bg-gradient-to-tr from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/20 backdrop-blur-xl rounded-[2.5rem] flex flex-col justify-between shadow-2xl shadow-emerald-900/20">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Layout className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Active Campaigns</p>
              <p className="text-3xl font-black text-white mt-1">{managedCampaigns.filter(c => c.active).length} Projects</p>
            </div>
          </div>
          <div className="p-8 bg-gradient-to-bl from-slate-900 via-blue-950/60 to-slate-900 border border-blue-500/20 backdrop-blur-xl rounded-[2.5rem] flex flex-col justify-between shadow-2xl shadow-blue-900/30">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Total Managed Projects</p>
              <p className="text-3xl font-black text-white mt-1">{managedCampaigns.length} Total</p>
            </div>
          </div>
          <div className="p-8 bg-gradient-to-tl from-slate-900 via-slate-800/50 to-slate-900 border border-dashed border-white/15 backdrop-blur-xl rounded-[2.5rem] flex flex-col justify-between shadow-2xl shadow-slate-900/30">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-white/40">
              <Settings size={24} />
            </div>
            <div>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Ownership Status</p>
              <p className="text-xl font-black text-white/70 mt-1">Verified Manager</p>
            </div>
          </div>
        </div>

        {/* Managed Projects List */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-20"></div>
          <div className="relative bg-gradient-to-br from-[#080d18] via-[#0f1a38] to-[#080d18] backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-black/50 overflow-hidden border border-white/8">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Your Projects</h2>
              <div className="px-5 py-2 bg-blue-500/15 border border-blue-500/30 rounded-full text-blue-300 text-[10px] font-black uppercase tracking-widest">
                On-Chain Verified
              </div>
            </div>

            <div className="p-8">
              {/* Pending Requests Section */}
              {pendingRequests.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                    Awaiting Admin Approval ({pendingRequests.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {pendingRequests.map((req, idx) => (
                      <div key={idx} className="rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 p-8 flex items-center gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                          In Review
                        </div>
                        <div className="w-24 h-24 rounded-2xl bg-white/10 border border-amber-500/20 flex-shrink-0 overflow-hidden">
                          {req.image ? (
                            <img src={req.image} className="w-full h-full object-cover opacity-60 grayscale" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-400/50">
                              <Layout size={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-black text-white mb-1">{req.name || 'Untitled Request'}</h4>
                          <p className="text-sm text-white/50 mb-3 line-clamp-1">{req.description || 'No description provided yet.'}</p>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-amber-500/15 rounded-full text-[10px] font-bold text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                              Category {req.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-white/10 mt-12" />
                </div>
              )}

              {!isLoading && managedCampaigns.length === 0 && pendingRequests.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/30">
                    <Layout size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">No campaigns found</h3>
                    <p className="text-white/50 text-sm mt-2">If you created a campaign, it might be syncing. Please wait or check your wallet.</p>
                  </div>
                  <Link
                    to="/campaigns/create"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all text-center shadow-lg shadow-blue-600/30"
                  >
                    Create New Campaign
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {managedCampaigns.map((camp) => (
                    <div key={camp.address} className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-white/10 hover:border-blue-500/50 backdrop-blur-sm transition-all duration-300 group/card hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden flex flex-col no-underline">
                      {/* Image Top Section */}
                      <div className="relative h-48 overflow-hidden bg-white/5">
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
                          to={`/campaign/${camp.address}`}
                          className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-blue-600 transition-all shadow-lg"
                        >
                          <ExternalLink size={18} />
                        </Link>
                      </div>

                      {/* Content Section */}
                      <div className="p-8 flex flex-col flex-1">
                        <h4 className="text-2xl font-black text-white mb-4 truncate">{camp.title}</h4>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-4 border-t border-white/10">
                            <div>
                              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Balance</p>
                              <p className="text-lg font-black text-emerald-400">{camp.balance} ETH</p>
                            </div>
                            <div className="text-right text-transparent">Action</div>
                          </div>

                          <div className="flex justify-between items-center py-4 border-t border-white/10">
                            <div>
                              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Contract Address</p>
                              <p className="text-white/70 font-mono text-[11px] bg-white/10 px-3 py-1.5 rounded-lg mt-1">
                                {camp.address.substring(0, 10)}...{camp.address.substring(34)}
                              </p>
                            </div>
                          </div>

                          <Link
                            to={`/campaign/${camp.address}`}
                            className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 group-hover/card:shadow-blue-600/30 text-center"
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
