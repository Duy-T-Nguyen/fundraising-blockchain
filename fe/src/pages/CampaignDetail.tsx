import React from 'react';
import { useParams } from 'react-router-dom';
import CampaignInfo from '../components/campaigndetail/CampaignInfo';
import DonateSidebar from '../components/campaigndetail/DonateSidebar';
import SpendingRequests from '../components/campaigndetail/SpendingRequests';
import { useCampaign } from '../hooks/useCampaign';

const CampaignDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { summary, isLoading, refresh } = useCampaign(address);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-5xl font-bold">404</div>
          <p className="text-gray-600 font-medium">Campaign not found or invalid address.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50 py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <CampaignInfo
            title={summary.title}
            description={`Manager: ${summary.manager}`}
            raised={`${summary.balance} ETH`}
            goal="Flexible"
            progressPercent={summary.balance !== '0' ? 100 : 0}
          />
          
          <SpendingRequests requests={[]} />
        </div>

        <div className="lg:col-span-1 self-start">
          <DonateSidebar
            campaignAddress={address}
            donors={summary.donorsCount}
            goal="Flexible"
            deadline="No Deadline"
            onSuccess={refresh}
          />
        </div>
      </div>
    </main>
  );
};

export default CampaignDetail;

