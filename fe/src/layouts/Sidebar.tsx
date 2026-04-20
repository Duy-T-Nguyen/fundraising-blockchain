import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  PlusCircle,
  Activity,
  Layout
} from 'lucide-react';

interface SidebarProps {
  // Props removed as they are no longer needed for the floating pill design
}

const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    { name: 'Donation Activity', path: '/dashboard/activity', icon: <Activity size={20} /> },
    { name: 'Creator Dashboard', path: '/dashboard/creator', icon: <Layout size={20} /> },
    { name: 'Launch Project', path: '/campaigns/create', icon: <PlusCircle size={20} /> },
  ];

  return (
    <aside 
      className="fixed left-6 top-1/2 -translate-y-1/2 z-[100] pointer-events-none"
    >
      <div className={`
        bg-slate-900/95 backdrop-blur-3xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 
        flex flex-col items-center py-4 px-2.5 transition-all duration-500 pointer-events-auto gap-4
      `}>
        {/* Navigation Items */}
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            title={item.name}
            className={({ isActive }) => `
              relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 group
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20' 
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
            {/* Tooltip on hover */}
            <div className="absolute left-full ml-5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-2xl border border-white/10 translate-x-[-10px] group-hover:translate-x-0">
              {item.name}
            </div>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
