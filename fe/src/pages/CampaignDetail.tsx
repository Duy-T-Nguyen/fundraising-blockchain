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
import ManagerFinancialCard from '../components/manager/ManagerFinancialCard';
import AIRelayerStatus from '../components/common/AIRelayerStatus';

const CampaignDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { address: userAddress } = useWallet();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Resolve slug to address
  const { address, isLoading: isResolving, error: resolutionError } = useCampaignResolver(slug);

  const { summary, isLoading, refresh } = useCampaign(address || undefined, userAddress || undefined);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const isManager = !!(userAddress && summary && userAddress.toLowerCase() === summary.manager.toLowerCase());
  const hasDonated = !!(summary && summary.userContribution > BigInt(0));

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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #0b1628 0%, #112044 20%, #1e3464 50%, #0b1628 100%)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/40 border-t-blue-400 rounded-full animate-spin"></div>
          <p className="text-white/50 font-bold animate-pulse tracking-widest text-xs uppercase">SYNCING WITH BLOCKCHAIN...</p>
        </div>
      </div>
    );
  }

  if (resolutionError || (!isResolving && !address) || (!isLoading && !summary) || !summary || !address) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #0b1628 0%, #112044 20%, #1e3464 50%, #0b1628 100%)' }}
      >
        <div className="text-center space-y-4">
          <div className="text-red-400 text-7xl font-black">404</div>
          <p className="text-white/70 font-bold">{resolutionError || 'Campaign Not Found'}</p>
          <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/20 transition">Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen py-20 px-6 lg:px-12"
      style={{ background: 'linear-gradient(180deg, #0b1628 0%, #112044 20%, #1e3464 50%, #0b1628 100%)' }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <CampaignHero
          address={address}
          title={summary.title}
          imageHash={summary.imageHash}
          balance={summary.balance}
          minimumContribution={summary.minimumContribution}
          donorsCount={summary.donorsCount}
          active={summary.active}
          isManager={isManager}
          onSuccess={handleDonationSuccess}
        />

        {/* Campaign Description Section */}
        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950/60 to-slate-900 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-900/30 border border-indigo-500/20">
          <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">About this Campaign</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-white/80 text-[18px] leading-relaxed font-medium whitespace-pre-wrap">
              {summary.description}
            </p>
          </div>
        </div>

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

        {/* Manager Financial Status */}
        {isManager && summary && (
          <ManagerFinancialCard
            totalBalance={summary.balance}
            availableFunds={summary.availableFunds}
            lockedFunds={summary.lockedFunds}
          />
        )}


        {/* Spending Requests Section */}
        <RequestsList
          address={address as string}
          isManager={isManager}
          hasDonated={hasDonated}
          userDonorId={summary.userDonorId}
          donorsCount={summary.donorsCount}
        />

        <div className="bg-gradient-to-bl from-slate-900 via-[#0a2030] to-slate-900 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-cyan-900/20 border border-cyan-500/15">
          <DonorsTable
            address={address || undefined}
            refreshTrigger={refreshKey}
          />
        </div>

        {/* AI Status Section */}
        <div className="pt-8">
          <AIRelayerStatus />
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

