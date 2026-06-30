import React from 'react';
import {
  TrendingUp,
  Package,
  CheckCircle2,
  CreditCard,
  History,
  ExternalLink,
  ShieldCheck,
  Lock
} from 'lucide-react';
import type { SupplierTask } from '../../types/supplier';

interface SupplierOverviewProps {
  info: any;
  tasks: SupplierTask[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

export const SupplierOverview: React.FC<SupplierOverviewProps> = ({
  info,
  tasks,
}) => {
  const activeTasks = tasks.filter(t => !t.complete);
  const settledTasks = tasks.filter(t => t.complete);

  const stats = [
    { label: 'Total Revenue', value: `${info.totalEarned} ETH`, icon: <TrendingUp size={18} />, bg: 'from-slate-900 via-emerald-950/20 to-slate-900', border: 'border-emerald-500/20', text: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
    { label: 'Active Jobs', value: activeTasks.length.toString().padStart(2, '0'), icon: <Package size={18} />, bg: 'from-slate-900 via-blue-950/20 to-slate-900', border: 'border-blue-500/20', text: 'text-blue-400', iconBg: 'bg-blue-500/10' },
    { label: 'Settled Tasks', value: settledTasks.length.toString().padStart(2, '0'), icon: <CheckCircle2 size={18} />, bg: 'from-slate-900 via-indigo-950/20 to-slate-900', border: 'border-indigo-500/20', text: 'text-indigo-400', iconBg: 'bg-indigo-500/10' },
    { label: 'Contract Value', value: tasks.reduce((acc, t) => acc + parseFloat(t.value), 0).toFixed(3) + ' ETH', icon: <CreditCard size={18} />, bg: 'from-slate-900 via-slate-800/20 to-slate-900', border: 'border-white/10', text: 'text-white/60', iconBg: 'bg-white/5' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.bg} border ${stat.border} p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl transition-all group hover:scale-[1.02]`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.text} border border-white/5`}>
                {stat.icon}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</div>
            </div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Security */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-emerald-500/20 p-10 rounded-[3rem] shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="text-emerald-400" size={24} />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-widest text-[12px] mb-1">Payment Security</h3>
                <p className="text-[10px] text-emerald-400/50 font-black uppercase tracking-widest">Active Protection</p>
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-emerald-400" size={16} />
                <span className="text-[12px] font-black text-emerald-400 uppercase tracking-widest">Liquidity Shield On</span>
              </div>
              <p className="text-sm text-white/60 font-medium leading-relaxed">
                The campaign budget for your active tasks is automatically reserved (locked) in the smart contract upon request creation. This ensures guaranteed payment upon successful completion.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-[10px] text-white/40 font-black uppercase tracking-widest bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              On-chain reservation
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/40 font-black uppercase tracking-widest bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              Guaranteed funds
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-white/5 p-10 rounded-[3rem] shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center">
              <History className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-black text-white uppercase tracking-widest text-[12px] mb-1">Recent Activity</h3>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Latest Settlements</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {settledTasks.length > 0 ? (
              settledTasks.slice(0, 4).map(task => (
                <div key={task.requestId} className="flex justify-between items-center bg-white/5 p-5 rounded-[1.5rem] border border-white/5 transition-all hover:bg-white/10 group cursor-pointer hover:border-blue-500/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                      <CreditCard size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white">{task.value} <span className="text-blue-400 text-[10px]">ETH</span></span>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest truncate max-w-[180px] font-black mt-0.5">{task.description}</span>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-white/10 group-hover:text-blue-400 transition-colors" />
                </div>
              ))
            ) : (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">No recent activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierOverview;
