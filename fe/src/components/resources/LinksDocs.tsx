
import { FileText, Code2, Layers } from 'lucide-react';

const GithubIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const links = [
  {
    icon: GithubIcon,
    title: 'GitHub Repository',
    label: '@fundraising-blockchain',
    href: 'https://github.com/Nguyen-Tien-Duy/fundraising-blockchain',
    color: 'hover:border-white'
  },
  {
    icon: FileText,
    title: 'Platform Whitepaper',
    label: 'v1.0.2 (PDF)',
    href: '#',
    color: 'hover:border-blue-500'
  },
  {
    icon: Code2,
    title: 'Campaign Manager ABI',
    label: 'Interface JSON',
    href: '#',
    color: 'hover:border-teal-500'
  },
  {
    icon: Layers,
    title: 'Contract Factory',
    label: '0x1234...5678',
    href: 'https://sepolia.etherscan.io/address/0x1234567890123456789012345678901234567890',
    color: 'hover:border-purple-500'
  }
];

const LinksDocs = () => {
  return (
    <section className="py-24 px-6 mb-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">Developers & Docs</h2>
          <p className="text-slate-400">Technical resources for transparency and integration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {links.map((link) => (
            <a 
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-8 rounded-3xl bg-white/5 border border-white/10 transition-all duration-300 relative group overflow-hidden ${link.color}`}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
              
              <div className="relative z-10">
                <link.icon className="text-slate-400 group-hover:text-white transition-colors mb-4" size={32} />
                <h3 className="text-lg font-bold text-white mb-1">{link.title}</h3>
                <p className="text-slate-500 text-sm group-hover:text-slate-300 transition-colors uppercase tracking-widest font-black text-[10px]">
                  {link.label}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LinksDocs;
