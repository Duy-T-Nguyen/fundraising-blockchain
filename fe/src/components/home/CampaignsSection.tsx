import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import CampaignCard from './CampaignCard';
import { useCampaignFactory } from '../../hooks/useCampaignFactory';
import Reveal from '../common/Reveal';

const CampaignsSection = () => {
  const { campaignAddresses, isLoading, error } = useCampaignFactory();

  if (isLoading) {
    return (
      <section id="campaigns" className="py-24 px-6 md:px-16">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="text-blue-400 animate-spin" />
          <p className="text-white/40 font-bold text-lg">Fetching campaigns from blockchain...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="campaigns" className="py-24 px-6 md:px-16">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center py-16 bg-red-500/5 backdrop-blur-md rounded-3xl border border-red-500/20 shadow-2xl gap-4">
          <AlertCircle size={40} className="text-red-400" />
          <p className="text-red-400 font-black text-xl">{error}</p>
          <p className="text-white/40">Please ensure you are connected to Sepolia testnet.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="campaigns" className="py-24 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Reveal direction="left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-14">
            <div>
              <h2 className="text-[40px] font-black text-white tracking-tight leading-none mb-3">
                Featured Campaigns
              </h2>
              <p className="text-gray-400 text-lg">
                Verified impact projects, deployed and governed on-chain.
              </p>
            </div>
            <span className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-400 text-sm font-black rounded-full border border-green-500/20 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live On-Chain
            </span>
          </div>
        </Reveal>

        {campaignAddresses.length === 0 ? (
          <Reveal direction="up" delay={200}>
            <div className="text-center py-24 bg-slate-900/20 backdrop-blur-sm rounded-3xl border-2 border-dashed border-white/10 shadow-xl">
              <p className="text-white/30 text-xl font-bold">No campaigns found yet.</p>
              <p className="text-white/20 mt-2 text-[15px]">Check back soon for new impact opportunities.</p>
            </div>
          </Reveal>
        ) : (
          <>
            <Reveal cascade direction="up" delay={200}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {[...campaignAddresses].reverse().slice(0, 6).map((addr) => (
                  <CampaignCard key={addr} address={addr} />
                ))}
              </div>
            </Reveal>

            <Reveal direction="up" delay={400}>
              <div className="mt-14 text-center">
                <Link
                  to="/#campaigns"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600/10 border-2 border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white font-bold rounded-2xl transition-all duration-300 hover:-translate-y-0.5 group shadow-xl shadow-blue-500/5"
                >
                  Explore All Campaigns
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
};

export default CampaignsSection;
