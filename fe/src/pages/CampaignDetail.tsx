import React from 'react';
import { useParams } from 'react-router-dom';
import CampaignHero from '../components/campaigndetail/CampaignHero';
import DonorsTable from '../components/campaigndetail/DonorsTable';
import { useCampaign } from '../hooks/useCampaign';

const CampaignDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { summary, isLoading, refresh } = useCampaign(address);

  // Auto-scroll to top when campaign address changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [address]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse tracking-widest text-xs uppercase">SYNCING WITH BLOCKCHAIN...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-7xl font-black">404</div>
          <p className="text-gray-600 font-bold">Campaign Not Found</p>
          <button onClick={() => window.history.back()} className="px-6 py-2 bg-gray-200 rounded-xl font-bold hover:bg-gray-300 transition">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] py-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <CampaignHero
          address={address}
          title={summary.title}
          imageHash={summary.imageHash}
          balance={summary.balance}
          donorsCount={summary.donorsCount}
          manager={summary.manager}
          active={summary.active}
          onSuccess={refresh}
        />

        {/* Campaign Description Section */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-xl border border-white/50 mb-8">
          <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">About this Campaign</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-gray-600 text-[18px] leading-relaxed font-medium whitespace-pre-wrap">
              {summary.description}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-white/50">
          <DonorsTable />
        </div>
      </div>
    </main>
  );
};

export default CampaignDetail;

