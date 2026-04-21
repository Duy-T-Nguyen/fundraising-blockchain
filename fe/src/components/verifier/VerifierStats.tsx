import React from 'react';
import { Shield, ClipboardCheck, Users, CheckCircle2 } from 'lucide-react';
import type { VerifierStats as StatsType } from '../../types/verifier';

interface VerifierStatsProps {
  stats: StatsType;
}

export const VerifierStats: React.FC<VerifierStatsProps> = ({ stats }) => {
  const cards = [
    { label: 'Total Assigments', value: stats.totalTasks, icon: <Shield size={18} />, color: 'slate' },
    { label: 'Expert Pending', value: stats.pendingExpert, icon: <ClipboardCheck size={18} />, color: 'indigo' },
    { label: 'Community Votes', value: stats.pendingCommunity, icon: <Users size={18} />, color: 'blue' },
    { label: 'Verified Cases', value: stats.completedCount, icon: <CheckCircle2 size={18} />, color: 'emerald' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all group overflow-hidden relative">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${card.color}-50 text-${card.color}-600`}>
              {card.icon}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</div>
          </div>
          <div className="text-2xl font-black text-slate-900 relative z-10">{card.value.toString().padStart(2, '0')}</div>
          
          {/* Subtle Background Accent */}
          <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-${card.color}-500/5 rounded-full blur-2xl group-hover:bg-${card.color}-500/10 transition-colors`} />
        </div>
      ))}
    </div>
  );
};
