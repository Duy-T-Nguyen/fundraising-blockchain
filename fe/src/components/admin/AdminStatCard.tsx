import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, icon }) => (
  <div className="p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-white/10 rounded-[2rem] group hover:border-blue-500/30 transition-all shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 backdrop-blur-xl">
    <div className="flex justify-between items-center mb-6">
      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 transition-colors group-hover:bg-blue-500/15 group-hover:border-blue-500/30">
        {icon}
      </div>
      <ArrowRight size={18} className="text-white/20 group-hover:translate-x-1 group-hover:text-white/40 transition-all" />
    </div>
    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">{title}</p>
    <p className="text-3xl font-black text-white tracking-tight">{value}</p>
  </div>
);

export default AdminStatCard;
