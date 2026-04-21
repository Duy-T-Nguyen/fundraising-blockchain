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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="p-4 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm hover:shadow-md">
            <ArrowLeft size={20} />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Supplier Authority</span>
              </div>
              <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Whitelisted</span>
              </div>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{name || 'nexus supplier'}</h1>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-[2rem] shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2.5 px-6 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300
                ${activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
