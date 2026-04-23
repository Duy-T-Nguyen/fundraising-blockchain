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
      className="group bg-white rounded-[2rem] overflow-hidden flex flex-col shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 border border-gray-100 no-underline h-full min-h-[420px]"
    >
      {/* Image Section with Overlaid Stats */}
      <div className="p-4 pb-0">
        <div className="relative h-56 overflow-hidden bg-gray-200 rounded-2xl">
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

          <div className="absolute bottom-5 right-5 flex items-center gap-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2">
              <Users size={22} strokeWidth={3} />
              <span className="text-[18px] font-bold tracking-tighter">{summary.donorsCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <EthIcon size={28} />
              <span className="text-[18px] font-bold tracking-tighter">{summary.balance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-7 flex flex-col flex-1">
        {/* Status Label */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[11px] font-black uppercase tracking-widest ${summary.active ? 'text-green-600' : 'text-gray-400'}`}>
            {summary.active ? 'Active' : 'Completed'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[22px] font-extrabold text-gray-900 mb-3 leading-[1.2] tracking-tight line-clamp-2 transition-colors">
          {summary.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-[15px] leading-relaxed text-gray-500 line-clamp-3 mb-5">
          {summary.description || 'Transparency-driven decentralised fundraising powered by secure blockchain smart contracts and IPFS evidence.'}
        </p>

        {/* Subtle Footnote */}
        <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-end">
          <ArrowRight size={22} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
};


export default CampaignCard;
