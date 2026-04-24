import React from 'react';
import {
  TrendingUp,
  ClipboardList,
  Building,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SupplierDashboardHeaderProps {
  name: string;
  activeTab: 'dashboard' | 'evidence' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'evidence' | 'profile') => void;
  pendingTasksCount: number;
}

export const SupplierDashboardHeader: React.FC<SupplierDashboardHeaderProps> = ({
  name,
  activeTab,
  setActiveTab,
  pendingTasksCount
}) => {
  const tabs = [
    { id: 'dashboard', icon: <TrendingUp size={16} />, label: 'Overview' },
    { id: 'evidence', icon: <ClipboardList size={16} />, label: 'Task Queue', count: pendingTasksCount },
    { id: 'profile', icon: <Building size={16} />, label: 'Registry' }
  ];

  return (
    <div className="relative mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
        <div className="flex items-center gap-6">
          <Link to="/" className="p-4 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center text-white/40 hover:text-white transition-all shadow-xl hover:bg-white/10">
            <ArrowLeft size={20} />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Supplier Authority</span>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Whitelisted</span>
              </div>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">{name || 'nexus supplier'}</h1>
          </div>
        </div>
      </div>

      {/* Tab Controls - Full Width & Centered */}
      <div className="flex gap-2 p-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[28px] w-full shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 flex items-center justify-center gap-2.5 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30'
                : 'text-white/40 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
