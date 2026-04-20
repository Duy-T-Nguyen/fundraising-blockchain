import React from 'react';
import { useParams } from 'react-router-dom';
import CampaignHero from '../components/campaigndetail/CampaignHero';
import DonorsTable from '../components/campaigndetail/DonorsTable';
import { useCampaign } from '../hooks/useCampaign';
import { useCampaignResolver } from '../hooks/useCampaignResolver';
import CreateRequestModal from '../components/manager/CreateRequestModal';
import RequestsList from '../components/manager/RequestsList';
import { useWallet } from '../hooks/useWallet';
import { LayoutDashboard, Plus } from 'lucide-react';

const CampaignDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { address: userAddress } = useWallet();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  // Resolve slug to address
  const { address, isLoading: isResolving, error: resolutionError } = useCampaignResolver(slug);
  
  const { summary, isLoading, refresh } = useCampaign(address || undefined, userAddress || undefined);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const isManager = !!(userAddress && summary && userAddress.toLowerCase() === summary.manager.toLowerCase());
  const hasDonated = !!(summary && summary.userContribution > 0n);

  const handleDonationSuccess = () => {
    refresh();
    setRefreshKey(prev => prev + 1);
  };

  // Auto-scroll to top when campaign address changes
  React.useEffect(() => {
    if (address) {
      window.scrollTo(0, 0);
    }
  }, [address]);

  if (isResolving || (isLoading && !summary)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse tracking-widest text-xs uppercase">SYNCING WITH BLOCKCHAIN...</p>
        </div>
      </div>
    );
  }

  if (resolutionError || (!isResolving && !address) || (!isLoading && !summary) || !summary || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-7xl font-black">404</div>
          <p className="text-gray-600 font-bold">{resolutionError || 'Campaign Not Found'}</p>
          <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-gray-200 rounded-xl font-bold hover:bg-gray-300 transition">Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] py-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Manager Dashboard Section */}
        {isManager && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-xl shadow-blue-600/20 flex flex-col md:flex-row items-center justify-between gap-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <LayoutDashboard size={20} className="text-blue-100" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-100">Manager Dashboard</h2>
              </div>
              <h3 className="text-2xl font-black">Campaign Control Center</h3>
              <p className="text-blue-100/70 text-sm font-medium mt-1">You can create spending requests to use the funds.</p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="relative z-10 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <Plus size={18} strokeWidth={3} />
              Create Request
            </button>

            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          </div>
        )}

        <CampaignHero
          address={address}
          title={summary.title}
          imageHash={summary.imageHash}
          balance={summary.balance}
          minimumContribution={summary.minimumContribution}
          donorsCount={summary.donorsCount}
          active={summary.active}
          onSuccess={handleDonationSuccess}
        />

        {/* Campaign Description Section */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-xl border border-white/50">
          <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">About this Campaign</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-gray-600 text-[18px] leading-relaxed font-medium whitespace-pre-wrap">
              {summary.description}
            </p>
          </div>
        </div>
        
        {/* Spending Requests Section */}
        <RequestsList 
          address={address as string} 
          isManager={isManager} 
          hasDonated={hasDonated}
          userFirstDonationBlock={summary.firstDonationBlock}
          donorsCount={summary.donorsCount} 
        />

        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-white/50">
          <DonorsTable 
            address={address || undefined} 
            refreshTrigger={refreshKey}
          />
        </div>
      </div>

      {isModalOpen && address && (
        <CreateRequestModal 
          address={address} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => refresh()}
        />
      )}
    </main>
  );
};

export default CampaignDetail;

