import React from 'react';
import { Shield, ClipboardCheck, Users, CheckCircle2 } from 'lucide-react';
import type { VerifierStats as StatsType } from '../../types/verifier';

interface VerifierStatsProps {
  stats: StatsType;
}

export const VerifierStats: React.FC<VerifierStatsProps> = ({ stats }) => {
  const cards = [
    { label: 'Total Assignments', value: stats.totalTasks, icon: <Shield size={18} />, colorClass: 'text-indigo-400', bgClass: 'bg-indigo-500/10', borderClass: 'border-indigo-500/20', glow: 'bg-indigo-500/5' },
    { label: 'Expert Pending', value: stats.pendingExpert, icon: <ClipboardCheck size={18} />, colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20', glow: 'bg-blue-500/5' },
    { label: 'Community Votes', value: stats.pendingCommunity, icon: <Users size={18} />, colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-500/20', glow: 'bg-cyan-500/5' },
    { label: 'Verified Cases', value: stats.completedCount, icon: <CheckCircle2 size={18} />, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/20', glow: 'bg-emerald-500/5' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {cards.map((card, i) => (
        <div key={i} className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-white/10 p-7 rounded-[2.5rem] shadow-2xl backdrop-blur-xl transition-all group overflow-hidden relative hover:border-white/20 hover:scale-[1.02] duration-500">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.bgClass} ${card.colorClass} border ${card.borderClass} shadow-xl shadow-black/20`}>
              {card.icon}
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{card.label}</div>
          </div>
          <div className="text-3xl font-black text-white relative z-10 tracking-tighter">{card.value.toString().padStart(2, '0')}</div>

          {/* Neon Glow Accent */}
          <div className={`absolute -bottom-8 -right-8 w-32 h-32 ${card.glow} rounded-full blur-[40px] group-hover:blur-[60px] transition-all`} />
        </div>
      ))}
    </div>
  );
};
