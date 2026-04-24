import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useNotification } from '../context/NotificationContext';
import logo from '../assets/logo_blockchain web.svg';
import metamaskLogo from '../assets/metamask.png';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'Resources', href: '/resources' },
  { label: 'Contact', href: '/contact' },
];

const Header = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const { address, isConnected, isConnecting, error, connect, disconnect } = useWallet();
  const toast = useNotification();

  // Surface wallet errors as toasts instead of inline text
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-[100] bg-slate-950/40 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-6xl mx-auto h-20 px-8 flex items-center justify-between gap-4">

        {/* Logo Section */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95 no-underline">
            <img
              src={logo}
              alt="Blockchain Logo"
              className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(60,177,154,0.3)]"
            />
            <span className="text-white text-xl font-black tracking-tighter uppercase whitespace-nowrap">
              Fundraising
            </span>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="hidden lg:flex items-center bg-white/5 rounded-full px-2 py-1 border border-white/10 backdrop-blur-md">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className={`
                        relative px-6 py-2.5 rounded-full text-[14px] font-bold tracking-tight transition-all duration-300
                        ${isActive
                        ? 'text-white bg-blue-600/20 shadow-inner'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Wallet Section */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {isConnected ? (
            <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-300 group/wallet">
              <div
                className="relative group cursor-pointer"
                onClick={handleCopy}
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-110 group-active:scale-95 ring-2 ring-white/5 group-hover:ring-blue-500/50">
                  <img
                    src={metamaskLogo}
                    alt="MetaMask"
                    className="w-full h-full object-contain p-1"
                  />
                </div>

                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl z-[110]">
                  {copied ? 'Copied!' : 'Copy Address'}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900" />
                </div>
              </div>

              <div className="w-px h-6 bg-white/10" />

              <button
                onClick={disconnect}
                className="px-3 py-1.5 text-[10px] text-slate-400 hover:text-red-400 font-black uppercase tracking-widest transition-all duration-200"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-2xl text-[14px] font-black uppercase tracking-widest cursor-pointer shadow-xl shadow-teal-900/20 transition-all duration-300 hover:shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
            >
              <span className="relative z-10">{isConnecting ? 'Syncing...' : 'Connect'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
