import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  PlusCircle,
  Activity,
  FolderLock
} from 'lucide-react';
import { useUserCampaigns } from '../hooks/useUserCampaigns';

interface SidebarProps {
  // Props removed as they are no longer needed for the floating pill design
}

const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const { managedCampaigns, isLoading } = useUserCampaigns();
  const [isMyCampaignsOpen, setIsMyCampaignsOpen] = useState(false);

  const navItems = [
    { name: 'Activity Hub', path: '/dashboard/activity', icon: <Activity size={20} /> },
    { name: 'Create Project', path: '/campaigns/create', icon: <PlusCircle size={20} /> },
  ];

  return (
    <aside 
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
    >
      <div className={`
        bg-white/20 backdrop-blur-xl rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 
        flex flex-col items-center py-4 px-2 transition-all duration-500 pointer-events-auto gap-4
      `}>
        {/* Navigation Items */}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.name}
            onClick={() => setIsMyCampaignsOpen(false)}
            className={({ isActive }) => `
              relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group
              ${isActive 
                ? 'bg-slate-950 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-white/20 hover:text-slate-700'
              }
            `}
          >
            {React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 18 })}
            {/* Tooltip on hover */}
            <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
              {item.name}
            </div>
          </NavLink>
        ))}

        {/* My Campaigns Dropdown / Popout - Only show if user has managed projects */}
        {(isLoading || managedCampaigns.length > 0) && (
          <div className="relative group/managed">
            <button 
              onClick={() => setIsMyCampaignsOpen(!isMyCampaignsOpen)}
              title="My Projects"
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${isMyCampaignsOpen ? 'bg-blue-600/80 text-white' : 'text-slate-500 hover:bg-white/20 hover:text-slate-700'}
              `}
            >
              <FolderLock size={18} />
            </button>
  
            {isMyCampaignsOpen && (
              <div className={`
                absolute left-full ml-4 top-0 bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-4 min-w-[200px]
                animate-in fade-in slide-in-from-left-4 duration-300 z-50
              `}>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700/60 border-b border-white/10 pb-3 mb-3">Managed Projects</h3>
                <div className="space-y-1 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                  {isLoading ? (
                    <div className="py-2 flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <div className="h-3 bg-white/20 rounded w-24 animate-pulse" />
                    </div>
                  ) : (
                    managedCampaigns.map((camp) => (
                      <Link
                        key={camp.address}
                        to={`/campaign/${camp.slug}`}
                        onClick={() => setIsMyCampaignsOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all
                          ${location.pathname === `/campaign/${camp.slug}` 
                            ? 'text-blue-700 bg-white/60 shadow-md ring-1 ring-white/50' 
                            : 'text-slate-600 hover:text-blue-600 hover:bg-white/30'}
                        `}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${location.pathname === `/campaign/${camp.slug}` ? 'bg-blue-500' : 'bg-slate-400'}`} />
                        <span className="truncate">{camp.title}</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
