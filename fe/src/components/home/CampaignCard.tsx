import { Link } from 'react-router-dom';
import { useCampaign } from '../../hooks/useCampaign';
import { Users, Activity, ArrowRight } from 'lucide-react';

interface CampaignCardProps {
  address: string;
}

const CampaignCard = ({ address }: CampaignCardProps) => {
  const { summary, isLoading } = useCampaign(address);

  if (isLoading || !summary) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-7 flex flex-col gap-4 animate-pulse shadow-xl shadow-gray-900/8 min-h-[250px]">
        <div className="h-5 w-28 bg-gray-100 rounded-full" />
        <div className="h-8 bg-gray-200 rounded-xl w-3/4" />
        <div className="h-4 bg-gray-100 rounded-lg w-full" />
        <div className="mt-auto flex gap-4">
          <div className="h-10 bg-gray-100 rounded-xl flex-1" />
          <div className="h-10 bg-gray-100 rounded-xl flex-1" />
        </div>
        <div className="h-12 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 p-7 flex flex-col shadow-xl shadow-gray-900/8 hover:shadow-2xl hover:shadow-blue-600/10 hover:-translate-y-2 transition-all duration-300">
      {/* Header Tags */}
      <div className="flex items-center justify-between mb-5">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-black rounded-full uppercase tracking-wider">
          Blockchain Verified
        </span>
        {summary.active ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-black text-green-600 uppercase tracking-wider">Active</span>
          </div>
        ) : (
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Deactivated</span>
        )}
      </div>

      {/* Main Title */}
      <h3 className="text-[22px] font-black text-gray-900 mb-2 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
        {summary.title}
      </h3>

      {/* Address Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg mb-6 w-fit border border-gray-100">
        <span className="text-[12px] text-gray-400 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>

      {/* Raised Amount Highlight */}
      <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
        <div className="text-[12px] font-bold text-blue-600 uppercase tracking-widest mb-1">Total Raised</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] font-black text-gray-900 leading-none">{summary.balance}</span>
          <span className="text-[16px] font-bold text-gray-500">ETH</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Users size={14} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-wider">Donors</span>
          </div>
          <span className="text-[18px] font-black text-gray-900 leading-none">{summary.donorsCount}</span>
        </div>
        <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Activity size={14} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-wider">Requests</span>
          </div>
          <span className="text-[18px] font-black text-gray-900 leading-none">{summary.numRequests}</span>
        </div>
      </div>

      {/* Action Button */}
      <Link
        to={`/campaign/${address}`}
        className="mt-auto flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300 group-hover:-translate-y-0.5 no-underline"
      >
        <span>Donate to Campaign</span>
        <ArrowRight size={18} strokeWidth={2.5} />
      </Link>
    </div>
  );
};


export default CampaignCard;
