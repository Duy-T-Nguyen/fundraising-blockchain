import { ExternalLink } from 'lucide-react';

const GithubIcon = ({ size = 20, className = "" }) => (
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

const LinkedinIcon = ({ size = 20, className = "" }) => (
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
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const DiscordIcon = ({ size = 20, className = "" }) => (
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
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <path d="M7.5 7.1c2-.7 4.6-1 7.4-1 1.6 0 3.1.1 4.5.3l.5-1A11.4 11.4 0 0 0 14.5 4a11.4 11.4 0 0 0-5.1 1.4L7.5 7.1Z" />
    <path d="M7.5 7.1c-2.3 2-3.1 5.3-3 8.3.1 1.7.6 3.3 1.2 4.1a.3.3 0 0 0 .3.1l2-.5a.3.3 0 0 0 .2-.1l.3-.7c-2-.6-3.7-1.7-5-3.3a.3.3 0 0 1 0-.3c1.2-.8 2.5-1.4 3.9-1.8a12 12 0 0 0 5-1V7.1Z" />
    <path d="M16.5 7.1c2.3 2 3.1 5.3 3 8.3-.1 1.7-.6 3.3-1.2 4.1a.3.3 0 0 1-.3.1l-2-.5a.3.3 0 0 1-.2-.1l-.3-.7c2-.6 3.7-1.7 5-3.3a.3.3 0 0 0 0-.3c-1.2-.8-2.5-1.4-3.9-1.8a12 12 0 0 1-5-1V7.1Z" />
  </svg>
);

const ContactSocials = () => {
  const socials = [
    {
      name: 'GitHub',
      icon: GithubIcon,
      label: '@fundraising-blockchain',
      href: 'https://github.com/Nguyen-Tien-Duy/fundraising-blockchain',
      color: 'hover:text-white hover:bg-white/10'
    },
    {
      name: 'LinkedIn',
      icon: LinkedinIcon,
      label: 'Platform Network',
      href: '#',
      color: 'hover:text-blue-400 hover:bg-blue-400/10'
    },
    {
      name: 'Discord',
      icon: DiscordIcon,
      label: 'Community Hub',
      href: '#',
      color: 'hover:text-indigo-400 hover:bg-indigo-400/10'
    }
  ];

  return (
    <div className="pt-12 border-t border-white/5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-white mb-2">Connect with us</h3>
          <p className="text-slate-500 text-sm">Join our community and stay updated on the latest research.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {socials.map((social) => (
            <a 
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-slate-400 font-bold transition-all duration-300 ${social.color}`}
            >
              <social.icon size={20} />
              <span>{social.name}</span>
              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactSocials;
