import React from 'react';
import { Zap, CheckCircle2, Users, TrendingUp, Activity } from 'lucide-react';
import AdminStatCard from '../AdminStatCard';
import type { GlobalStats } from '../../../hooks/useAdmin';

interface OverviewTabProps {
  stats: GlobalStats;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top row cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Active Campaigns" value={stats.activeCampaigns} icon={<Activity className="text-orange-500" size={24} />} />
        <AdminStatCard title="Completed Projects" value={stats.completedCampaigns} icon={<CheckCircle2 className="text-green-500" size={24} />} />
        <AdminStatCard title="Unique Participations" value={stats.totalDonors} icon={<Users className="text-blue-500" size={24} />} />
        <AdminStatCard title="Total Global Raised" value={`${parseFloat(stats.totalDonated).toFixed(3)} ETH`} icon={<TrendingUp className="text-indigo-500" size={24} />} />
      </div>

      {/* Summary Section */}
      <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
            <Zap className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-none mb-1">Ecosystem Summary</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Protocol Performance Metrics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <SummaryItem label="Global Campaign Count" value={stats.totalCampaigns} />
          <SummaryItem label="Current Anti-Spam Fee" value={`${stats.antiSpamFee} ETH`} />
          <SummaryItem label="Avg Donation / Project" value={`${(parseFloat(stats.totalDonated) / (stats.totalCampaigns || 1)).toFixed(4)} ETH`} />
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value }: { label: string, value: string | number }) => (
  <div className="border-l-4 border-slate-100 pl-8 py-1 h-full">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
  </div>
);

export default OverviewTab;
