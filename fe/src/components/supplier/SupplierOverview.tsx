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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-white mb-1">Performance Index</h3>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Revenue & Fulfillment Over Time</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Synchronized</span>
            </div>
          </div>

          <div className="h-64 w-full relative px-2">
            <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible">
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#6ee7b7" />
                </linearGradient>
                <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.15)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                </linearGradient>
              </defs>

              {/* Background Grid */}
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="white" strokeOpacity="0.03" strokeWidth="1" />
              ))}

              {/* Echo Lines (Historical/Context Paths as seen in reference image) */}
              <path
                d="M 50 260 Q 200 240, 350 220 T 650 180 T 950 140"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="1.5"
                strokeOpacity="0.1"
              />
              <path
                d="M 50 240 Q 200 210, 350 170 T 650 120 T 950 40"
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
                strokeOpacity="0.08"
              />

              {/* Atmospheric Area Fill */}
              <path
                d="M 50 250 Q 200 230, 350 190 T 650 140 T 950 60 L 950 250 L 50 250 Z"
                fill="url(#fillGradient)"
              />

              {/* 3D Glowing Layers */}
              {/* Layer 1: Wide Soft Outer Glow */}
              <path
                d="M 50 250 Q 200 230, 350 190 T 650 140 T 950 60"
                fill="none"
                stroke="#10b981"
                strokeWidth="14"
                strokeOpacity="0.15"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Layer 2: Medium Neon Halo */}
              <path
                d="M 50 250 Q 200 230, 350 190 T 650 140 T 950 60"
                fill="none"
                stroke="#34d399"
                strokeWidth="6"
                strokeOpacity="0.3"
                strokeLinecap="round"
              />

              {/* Layer 3: The Core High-Intensity Path */}
              <path
                d="M 50 250 Q 200 230, 350 190 T 650 140 T 950 60"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              />

              {/* Terminal Data Point (Glowing Node) */}
              <circle cx="950" cy="60" r="12" fill="#10b981" opacity="0.1" className="animate-pulse" />
              <circle cx="950" cy="60" r="6" fill="#0b1628" stroke="#34d399" strokeWidth="2" />
              <circle cx="950" cy="60" r="2.5" fill="white" className="shadow-[0_0_8px_white]" />
            </svg>
            <div className="flex justify-between mt-6 px-4">
              {['Launch', 'Phase I', 'Phase II', 'Live'].map((label, i) => (
                <span key={i} className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] font-mono">{label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Side Actions/History */}
        <div className="lg:col-span-4 space-y-6">

          <div className="bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-emerald-500/20 p-8 rounded-[3rem] shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-emerald-400" size={20} />
              </div>
              <h3 className="font-black text-white uppercase tracking-widest text-[11px]">Payment Security</h3>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="text-emerald-400" size={14} />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Liquidity Shield On</span>
              </div>
              <p className="text-[11px] text-white/50 font-medium leading-relaxed">
                The campaign budget for your active tasks is automatically reserved (locked) in the smart contract upon request creation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[10px] text-white/40 font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                On-chain reservation active
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white/40 font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                Guaranteed fulfillment funds
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-white/5 p-8 rounded-[3rem] shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center">
                <History className="text-white" size={20} />
              </div>
              <h3 className="font-black text-white uppercase tracking-widest text-[11px]">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {settledTasks.slice(0, 3).map(task => (
                <div key={task.requestId} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 transition-all hover:bg-white/10 group cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-white">{task.value} <span className="text-blue-400">ETH</span></span>
                    <span className="text-[9px] text-white/30 uppercase tracking-[0.1em] truncate max-w-[120px] font-black mt-0.5">{task.description}</span>
                  </div>
                  <ExternalLink size={12} className="text-white/20 group-hover:text-blue-400 transition-colors" />
                </div>
              ))}
              {settledTasks.length === 0 && (
                <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No recent jobs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
