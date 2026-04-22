import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampaign } from '../../hooks/useCampaign';
import { Users, ArrowRight } from 'lucide-react';
import EthIcon from '../common/EthIcon';

interface CampaignCardProps {
  address: string;
}

const CampaignCard = ({ address }: CampaignCardProps) => {
  const { summary, isLoading } = useCampaign(address);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fallback images for premium look while real IPFS images are not available
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

  if (isLoading || !summary) {
    return (
      <div className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col animate-pulse shadow-sm border border-gray-100 h-full min-h-[480px]">
        <div className="h-64 bg-gray-200" />
        <div className="p-8 space-y-4">
          <div className="h-4 w-20 bg-gray-100 rounded-full" />
          <div className="h-8 bg-gray-200 rounded-xl w-3/4" />
          <div className="h-4 bg-gray-100 rounded-lg w-full" />
          <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
        </div>
      </div>
    );
  }

  const campaignImage = summary.imageHash && summary.imageHash !== 'ipfs://placeholder' && summary.imageHash !== ''
    ? `https://gateway.pinata.cloud/ipfs/${summary.imageHash.replace('ipfs://', '')}`
    : getPlaceholderImage();

  const detailUrl = `/campaign/${address}`;

  return (
    <Link
      to={detailUrl}
      className="group bg-white rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-gray-100 no-underline h-full min-h-[480px]"
    >
      {/* Image Section with Overlaid Stats */}
      <div className="relative h-64 overflow-hidden bg-gray-200">
        {/* Skeleton Loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        )}

        <img
          src={campaignImage}
          alt={summary.title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-125 group-hover:brightness-110 transition-all duration-700 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
        />

        {/* Gradient Overlay for bottom stats */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90" />

        <div className="absolute bottom-6 right-6 flex items-center gap-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2">
            <Users size={26} strokeWidth={3} />
            <span className="text-[20px] font-black tracking-tighter">{summary.donorsCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <EthIcon size={32} />
            <span className="text-[20px] font-black tracking-tighter">{summary.balance}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-9 flex flex-col flex-1">
        {/* Status Label */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-[12px] font-black uppercase tracking-widest ${summary.active ? 'text-green-600' : 'text-gray-400'}`}>
            {summary.active ? 'Active' : 'Completed'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[26px] font-extrabold text-gray-900 mb-4 leading-[1.2] tracking-tight line-clamp-2 transition-colors">
          {summary.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-[17px] leading-relaxed text-gray-500 line-clamp-3 mb-6">
          {summary.description || 'Transparency-driven decentralised fundraising powered by secure blockchain smart contracts and IPFS evidence.'}
        </p>

        {/* Subtle Footnote */}
        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
          <span className="text-[13px] font-mono text-gray-300 uppercase tracking-tighter">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
};


export default CampaignCard;
