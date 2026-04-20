import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import metamaskLogo from '../assets/metamask.png';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'Resources', href: '/#resources' },
  { label: 'Contact', href: '/#contact' },
];

const Header = () => {
  const [activeLink, setActiveLink] = useState('Home');
  const [copied, setCopied] = useState(false);
  const { address, isConnected, isConnecting, error, connect, disconnect } = useWallet();

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="bg-blue-600 sticky top-0 z-50 shadow-md">
      <nav className="relative flex items-center justify-center h-15 px-10">
        <ul className="flex items-center gap-2 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.href}
                onClick={() => setActiveLink(link.label)}
                className={`text-blue-100 no-underline text-[17px] font-medium px-5 py-2 rounded-md transition-all duration-200 hover:bg-white/15 hover:text-white ${
                  activeLink === link.label ? 'text-white font-semibold' : ''
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="absolute right-10 flex flex-col items-end gap-1">
          {isConnected ? (
            <div className="flex items-center gap-3 bg-white/10 px-2 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
              <div 
                className="relative group cursor-pointer"
                onClick={handleCopy}
              >
                {/* MetaMask Icon using Image */}
                <div className="w-9 h-9 rounded-full overflow-hidden transition-all duration-300 group-hover:scale-110 group-active:scale-95">
                  <img 
                    src={metamaskLogo} 
                    alt="MetaMask" 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Tooltip/Label - Positioned BELOW because header is at top */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 border border-white/10 text-white text-[10px] font-bold  tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl z-20">
                  {copied ? ' Copied!' : 'Copy full address'}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900" />
                </div>
              </div>
              
              <div className="w-[1px] h-6 bg-white/20" />
              
              <button
                onClick={disconnect}
                className="pr-2 text-[10px] text-white/70 hover:text-white font-black uppercase tracking-[0.1em] transition-all duration-200 hover:text-red-400"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 px-5 py-2.5 rounded-lg text-[16px] font-semibold cursor-pointer tracking-wide shadow-lg shadow-emerald-400/30 transition-all duration-200 hover:from-teal-500 hover:to-teal-600 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-wait"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}

          {/* Error toast */}
          {error && (
            <span className="text-xs text-red-300 max-w-[220px] text-right leading-tight">
              ⚠ {error}
            </span>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
