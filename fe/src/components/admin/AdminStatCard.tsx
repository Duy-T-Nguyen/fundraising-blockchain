import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, icon }) => (
  <div className="p-8 bg-white border border-slate-200 rounded-[32px] group hover:border-slate-300 transition-all shadow-sm hover:shadow-md">
    <div className="flex justify-between items-center mb-6">
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-colors group-hover:bg-blue-50 group-hover:border-blue-100">
        {icon}
      </div>
      <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 group-hover:text-slate-400 transition-all" />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

export default AdminStatCard;
