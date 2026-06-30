import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  PlusCircle,
  Activity,
  Layout,
  Menu,
  X,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useUserActivity } from '../hooks/useUserActivity';
import { useSupplier } from '../hooks/useSupplier';
import { useAdmin } from '../hooks/useAdmin';
import { useVerifierTasks } from '../hooks/useVerifierTasks';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { address } = useWallet();
  const { managedCampaigns, pendingRequests } = useUserActivity(address as `0x${string}`);
  const { info } = useSupplier(address || undefined);
  const { tasks: verifierTasks } = useVerifierTasks(address as `0x${string}` || undefined);
  const { isAdmin } = useAdmin();

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Donation Activity', path: '/dashboard/activity', icon: <Activity size={22} /> },
    ...((managedCampaigns.length > 0 || pendingRequests.length > 0) ? [{ name: 'Creator Dashboard', path: '/dashboard/creator', icon: <Layout size={22} /> }] : []),
    ...(info?.isRegistered ? [{ name: 'Supplier Portal', path: '/supplier', icon: <Truck size={22} /> }] : []),
    ...(verifierTasks.length > 0 ? [{ name: 'Verifier Portal', path: '/verifier', icon: <ShieldCheck size={22} /> }] : []),
    ...(isAdmin ? [{ name: 'Platform Admin', path: '/admin', icon: <ShieldCheck size={22}/> }] : []),
    { name: 'Launch Project', path: '/campaigns/create', icon: <PlusCircle size={22} /> },
  ];

  return (
    <aside 
      ref={sidebarRef}
      className="fixed left-8 bottom-8 z-[100]"
    >
      <div className="relative flex flex-col-reverse items-center">
        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative z-10
            ${isOpen 
              ? 'bg-blue-600 text-white scale-90' 
              : 'bg-slate-900/90 text-blue-400 hover:bg-blue-600 hover:text-white border border-white/20'
            }
          `}
        >
          <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
            {isOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={2.5} />}
          </div>
          
          {/* Pulsing effect when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping -z-10"></span>
          )}
        </button>

        {/* The Vertical Action Pill - Now Expanding UPWARDS */}
        <div className={`
          flex flex-col items-center gap-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isOpen 
            ? 'opacity-100 translate-y-[-24px] pointer-events-auto mb-4 p-2 bg-slate-900/95 backdrop-blur-3xl rounded-full border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
            : 'opacity-0 translate-y-[20px] pointer-events-none h-0 overflow-hidden'
          }
        `}>
          {navItems.map((item, idx) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              style={{ transitionDelay: `${isOpen ? idx * 50 : 0}ms` }}
              className={({ isActive }) => `
                relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group
                ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-50'}
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {item.icon}
              {/* Tooltip - Now on the RIGHT of the vertical pill */}
              <div className="absolute left-full ml-5 px-4 py-2 bg-slate-950 backdrop-blur-xl text-white text-[11px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-2xl border border-white/10 translate-x-[-10px] group-hover:translate-x-0">
                {item.name}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-950" />
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
