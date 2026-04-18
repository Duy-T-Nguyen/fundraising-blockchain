import React, { useState } from 'react';
import { 
  Users, Share2, Send, 
  Link as LinkIcon, DollarSign,
  Heart, ShieldCheck, Zap, Globe
} from 'lucide-react';
import { parseEther } from 'viem';
import { getWalletClient, publicClient } from '../../blockchain/client';
import { ABIS } from '../../blockchain/constants';
import { useWallet } from '../../hooks/useWallet';

// Custom SVG Icons for brands not available in Lucide v1.x
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

interface CampaignHeroProps {
  address: string | undefined;
  title: string;
  description: string;
  imageHash: string;
  balance: string;
  donorsCount: number;
  manager: string;
  active: boolean;
  onSuccess?: () => void;
}

const CampaignHero: React.FC<CampaignHeroProps> = ({
  address,
  title,
  description,
  imageHash,
  balance,
  donorsCount,
  manager,
  active,
  onSuccess,
}) => {
  const [donateAmount, setDonateAmount] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isConnected, connect } = useWallet();

  const handleDonate = async () => {
    if (!isConnected) { await connect(); return; }
    if (!address || !donateAmount || isNaN(Number(donateAmount))) return;

    setIsPending(true);
    try {
      const walletClient = getWalletClient();
      if (!walletClient) throw new Error('No wallet client found');

      const [userAddr] = await walletClient.getAddresses();
      const { request } = await publicClient.simulateContract({
        account: userAddr,
        address: address as `0x${string}`,
        abi: ABIS.CAMPAIGN,
        functionName: 'donate',
        value: parseEther(donateAmount),
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      
      setDonateAmount('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Donation error:', err);
    } finally {
      setIsPending(false);
    }
  };

  const shareLinks = [
    { icon: <TwitterIcon />, label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: <FacebookIcon />, label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: <Send size={18} />, label: 'Telegram', color: 'hover:text-blue-500' },
    { icon: <LinkIcon size={18} />, label: 'Copy Link', color: 'hover:text-gray-400' },
  ];

  // Consistent placeholder logic to match CampaignCard
  const getPlaceholderImage = () => {
    if (!address) return 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop';
    const lastChar = address.slice(-1).toLowerCase();
    const index = parseInt(lastChar, 16) % 5;
    const placeholders = [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop', // Charity
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop', // Education
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop', // Medical
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop', // Disaster
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop', // Environment
    ];
    return placeholders[index];
  };

  const campaignImage = imageHash && imageHash !== 'ipfs://placeholder' && imageHash !== ''
    ? `https://gateway.pinata.cloud/ipfs/${imageHash.replace('ipfs://', '')}`
    : getPlaceholderImage();

  return (
    <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden mb-12">
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch">
        
        {/* LEFT: IMAGE SECTION */}
        <div className="w-full lg:w-[45%] p-8 lg:pr-4">
          <div className="relative h-[300px] lg:h-full rounded-[2rem] overflow-hidden shadow-2xl group bg-gray-100">
            {/* Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 z-10" />
            )}
            
            <img 
              src={campaignImage} 
              alt={title}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
            />
            {/* Tag Overlay */}
            <div className="absolute top-6 left-6 z-20">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${
                active ? 'bg-amber-400 text-amber-950' : 'bg-gray-400 text-white'
              }`}>
                {active ? 'Active' : 'Completed'}
              </span>
            </div>
            
            {/* Bottom Floating Stats (On Image) */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-white drop-shadow-lg z-20">
              <div className="flex items-center gap-2">
                <Users size={18} strokeWidth={3} />
                <span className="font-black text-lg">{donorsCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <span className="text-black text-xs font-black">ETH</span>
                </div>
                <span className="font-black text-xl">{balance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: CONTENT SECTION */}
        <div className="w-full lg:w-[55%] p-8 lg:pl-6 flex flex-col justify-between">
          <div>
            {/* Category/Info Line */}
            <div className="flex items-center gap-2 text-blue-500 mb-4">
              <Zap size={16} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Empowered by FundChain</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-8 tracking-tight">
              {title}
            </h1>
            
            {/* Manager Info */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-8 max-w-sm">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Manager</p>
                <p className="text-sm font-bold text-gray-700 truncate w-48">{manager}</p>
              </div>
            </div>
          </div>

          {/* ACTIONS & SHARE */}
          <div className="space-y-6 pt-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  type="number"
                  placeholder="Amount (ETH)"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                />
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <button 
                onClick={handleDonate}
                disabled={isPending || !donateAmount}
                className="px-10 h-14 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-200 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
              >
                {isPending ? 'Processing...' : (
                  <>
                    <Heart size={20} className="group-hover:scale-125 transition-transform" />
                    Donate Now
                  </>
                )}
              </button>
            </div>

            {/* Social Share */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spread the word</span>
                <div className="flex gap-3">
                  {shareLinks.map((link, i) => (
                    <button 
                      key={i} 
                      title={link.label}
                      className={`w-9 h-9 flex items-center justify-center text-gray-400 ${link.color} transition-colors`}
                    >
                      {link.icon}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400">
                <Globe size={14} />
                Global Campaign
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignHero;
