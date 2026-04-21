import React from 'react';
import { 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  CreditCard, 
  History,
  ExternalLink
} from 'lucide-react';
import type { SupplierTask } from '../../types/supplier';

interface SupplierOverviewProps {
  info: any;
  tasks: SupplierTask[];
}

export const SupplierOverview: React.FC<SupplierOverviewProps> = ({
  info,
  tasks,
}) => {
  const activeTasks = tasks.filter(t => !t.complete);
  const settledTasks = tasks.filter(t => t.complete);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `${info.totalEarned} ETH`, icon: <TrendingUp size={18} />, color: 'emerald' },
          { label: 'Active Jobs', value: activeTasks.length.toString().padStart(2, '0'), icon: <Package size={18} />, color: 'blue' },
          { label: 'Settled Tasks', value: settledTasks.length.toString().padStart(2, '0'), icon: <CheckCircle2 size={18} />, color: 'indigo' },
          { label: 'Contract Value', value: tasks.reduce((acc, t) => acc + parseFloat(t.value), 0).toFixed(3) + ' ETH', icon: <CreditCard size={18} />, color: 'slate' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
                {stat.icon}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Performance Index</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">Revenue & Fulfillment Over Time</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-600 uppercase">Synchronized</span>
            </div>
          </div>

          <div className="h-64 w-full relative px-2">
            <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              <path 
                d="M 50 250 Q 200 230, 350 190 T 650 140 T 950 60 L 950 250 L 50 250 Z" 
                fill="url(#chartGradient)"
              />
              <path 
                d="M 50 250 Q 200 230, 350 190 T 650 140 T 950 60" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="4" 
                strokeLinecap="round"
              />
              <circle cx="950" cy="60" r="6" fill="#fff" stroke="#10b981" strokeWidth="3" shadow-lg />
            </svg>
            <div className="flex justify-between mt-6 px-4">
              {['Launch', 'Phase I', 'Phase II', 'Live'].map((label, i) => (
                <span key={i} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Side Actions/History */}
        <div className="lg:col-span-4 space-y-6">

          <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                <History className="text-slate-900" size={20} />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {settledTasks.slice(0, 3).map(task => (
                <div key={task.requestId} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-white group">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-900">{task.value} ETH</span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-tighter truncate max-w-[100px]">{task.description}</span>
                  </div>
                  <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
              {settledTasks.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No recent jobs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
