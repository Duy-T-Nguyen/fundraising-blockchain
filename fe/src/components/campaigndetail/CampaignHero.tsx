import React, { useState } from 'react';
import { 
  Users, Send, 
  Link as LinkIcon,
  Heart, Zap, Globe, ShieldCheck,
} from 'lucide-react';
import { parseEther } from 'viem';

import EthIcon from '../common/EthIcon';
import { getWalletClient, publicClient } from '../../blockchain/client';
import { ABIS } from '../../blockchain/constants';
import { useWallet } from '../../hooks/useWallet';
import Notification, { type NotificationType } from '../common/Notification';

// Custom SVG Icons
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

interface CampaignHeroProps {
  address: string | undefined;
  title: string;
  imageHash: string;
  balance: string;
  minimumContribution: string;
  donorsCount: number;
  active: boolean;
  isManager?: boolean;
  onSuccess?: () => void;
}

const CampaignHero: React.FC<CampaignHeroProps> = ({
  address,
  title,
  imageHash,
  balance,
  minimumContribution,
  donorsCount,
  active,
  isManager,
  onSuccess,
}) => {
  const [donateAmount, setDonateAmount] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isConnected, connect, switchNetwork } = useWallet();
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
    isVisible: boolean;
  }>({ message: '', type: 'info', isVisible: false });

  const isAmountTooLow = donateAmount !== '' && parseFloat(donateAmount) < parseFloat(minimumContribution);

  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type, isVisible: true });
  };

  const handleDonate = async () => {
    if (!isConnected) { await connect(); return; }
    if (!address || !donateAmount || isNaN(Number(donateAmount)) || isAmountTooLow) return;

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
      
      showNotification('Donation successful! Thank you for your kindness.', 'success');
      setDonateAmount('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Donation error:', err);
      let errorMsg = 'Transaction failed.';
      
      const isChainError = err.message?.includes('ChainMismatchError') || 
                           err.message?.includes('target chain') ||
                           err.message?.includes('Chain mismatch');

      if (isChainError) {
        await switchNetwork(11155111);
      } else if (err.message?.includes('User rejected')) {
        errorMsg = 'Transaction rejected by user.';
        showNotification(errorMsg, 'error');
      } else if (err.message?.includes('InsufficientFunds') || err.message?.includes('insufficient funds')) {
        errorMsg = 'Insufficient funds for this donation.';
        showNotification(errorMsg, 'error');
      } else if (err.shortMessage) {
        errorMsg = err.shortMessage;
        showNotification(errorMsg, 'error');
      } else {
        showNotification(errorMsg, 'error');
      }
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

  const getPlaceholderImage = () => {
    if (!address) return 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop';
    const lastChar = address.slice(-1).toLowerCase();
    const index = parseInt(lastChar, 16) % 5;
    const placeholders = [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop',
    ];
    return placeholders[index];
  };

  const campaignImage = imageHash && imageHash !== 'ipfs://placeholder' && imageHash !== ''
    ? `https://gateway.pinata.cloud/ipfs/${imageHash.replace('ipfs://', '')}`
    : getPlaceholderImage();

  return (
    <>
      <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden mb-12">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch">
          
          {/* LEFT: IMAGE SECTION */}
          <div className="w-full lg:w-[45%] p-8 lg:pr-4">
            <div className="relative h-[300px] lg:h-full rounded-[2rem] overflow-hidden shadow-2xl group bg-gray-100">
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
              <div className="absolute top-6 left-6 z-20">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${
                  active ? 'bg-amber-400 text-amber-950' : 'bg-gray-400 text-white'
                }`}>
                  {active ? 'Active' : 'Completed'}
                </span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-white drop-shadow-lg z-20">
                <div className="flex items-center gap-2">
                  <Users size={26} strokeWidth={3} />
                  <span className="font-black text-2xl tracking-tighter">{donorsCount}</span>
                </div>
                <div className="flex items-center gap-3">
                  <EthIcon size={32} />
                  <span className="font-black text-2xl tracking-tighter">{balance}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="w-full lg:w-[55%] p-8 lg:pl-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-500">
                <Zap size={16} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Empowered by FundChain</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                {title}
              </h1>
              
            </div>

            <div className="space-y-6">
              {!isManager ? (
                <div className="flex flex-col gap-2 pt-6 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <input 
                        type="number"
                        placeholder="Amount (ETH)"
                        value={donateAmount}
                        onChange={(e) => setDonateAmount(e.target.value)}
                        className={`w-full h-14 pl-12 pr-4 bg-gray-50 border ${isAmountTooLow ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500/10 focus:border-blue-500'} rounded-2xl text-lg font-bold focus:outline-none transition-all`}
                      />
                      <EthIcon className={`absolute left-4 top-1/2 -translate-y-1/2 ${isAmountTooLow ? 'text-red-500' : 'text-gray-400'}`} size={20} />
                    </div>
                    <button 
                      onClick={handleDonate}
                      disabled={isPending || !donateAmount || isAmountTooLow}
                      className={`px-10 h-14 ${isAmountTooLow ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'} disabled:bg-gray-200 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group`}
                    >
                      {isPending ? 'Processing...' : (
                        isAmountTooLow ? (
                          'Amount too low'
                        ) : (
                          <>
                            <Heart size={20} className="group-hover:scale-125 transition-transform" />
                            Donate Now
                          </>
                        )
                      )}
                    </button>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest pl-2 transition-colors ${isAmountTooLow ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                    {isAmountTooLow ? '⚠️ Below requirements' : `Min contribution: ${minimumContribution} ETH`}
                  </p>
                </div>
              ) : (
                <div className="pt-6 border-t border-gray-100">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-blue-600">
                      <ShieldCheck size={24} strokeWidth={3} />
                      <span className="text-sm font-black uppercase tracking-widest">Management Mode</span>
                    </div>
                    <p className="text-blue-800/70 text-sm font-medium leading-relaxed">
                      You are the manager of this campaign. For security and transparency, <strong>self-donations are restricted</strong> by the protocol. Please use the dashboard below to manage your funds.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share this</span>
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
                  Global Impact
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Notification 
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </>
  );
};

export default CampaignHero;
