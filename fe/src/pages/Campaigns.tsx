import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Loader2, AlertCircle, ArrowRight, LayoutGrid, Zap, ShieldCheck } from 'lucide-react';
import CampaignCard from '../components/home/CampaignCard';
import { useCampaignFactory } from '../hooks/useCampaignFactory';
import Reveal from '../components/common/Reveal';

const CATEGORIES = ['All Categories', 'Education', 'Medical', 'Disaster', 'Environment', 'Others'];
const STATUSES = ['Status: Active', 'Status: All', 'Status: Inactive'];
const SORTS = ['Most Funded', 'Most Donors', 'Newest'];

const Campaigns = () => {
  const { campaigns, isLoading, error, refresh } = useCampaignsWithSummaries();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [sort, setSort] = useState(SORTS[0]);
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    // Filter by Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q)
      );
    }

    // Filter by Category
    if (category !== 'All Categories') {
      const catIndex = CATEGORIES.indexOf(category) - 1; // -1 because index 0 is 'All Categories'
      result = result.filter(c => c.category === catIndex);
    }

    // Filter by Status
    if (status !== 'Status: All') {
      const isActive = status === 'Status: Active';
      result = result.filter(c => c.active === isActive);
    }

    // Sorting
    if (sort === 'Most Funded') {
      result.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    } else if (sort === 'Most Donors') {
      result.sort((a, b) => b.donorsCount - a.donorsCount);
    } else if (sort === 'Newest') {
      // Index is already roughly chronological, so we just keep it or reverse it
      // Let's assume we want newest on top, which is reversing the factory order
      result.reverse();
    }

    return result;
  }, [campaigns, search, category, status, sort]);

  const displayedCampaigns = useMemo(() => {
    return filteredCampaigns.slice(0, visibleCount);
  }, [filteredCampaigns, visibleCount]);

  return (
    <main
      style={{
        background:
          'linear-gradient(180deg, rgba(11, 22, 40, 0.9) 0%, rgba(17, 32, 68, 0.8) 10%, rgba(30, 52, 100, 0.7) 22%, rgba(74, 111, 165, 0.6) 35%, rgba(138, 174, 212, 0.4) 46%, rgba(196, 214, 240, 0.2) 56%, rgba(221, 232, 248, 0.1) 65%, transparent 100%)',
        minHeight: '100vh',
      }}
    >
      {/* ── Hero Banner ── */}
      <section className="px-6 md:px-16 pt-14 pb-10">
        <div className="max-w-6xl mx-auto">
          <Reveal direction="none">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl border border-white/10 shadow-2xl shadow-blue-900/40 p-10 md:p-14">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

              <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
                {/* Left content */}
                <div className="flex-1">
                  <Reveal direction="down" delay={200}>
                    <span className="inline-flex items-center gap-2 px-3 py-1 mb-5 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-black uppercase tracking-widest rounded-full">
                      <Zap size={11} />
                      Blockchain-Powered
                    </span>
                  </Reveal>
                  <Reveal direction="up" delay={400}>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
                      Create Your<br />
                      <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Campaign</span>
                    </h1>
                  </Reveal>
                  <Reveal direction="up" delay={600}>
                    <p className="text-blue-100/60 text-[17px] leading-relaxed max-w-md mb-8">
                      Raise funds transparently on blockchain. Submit your campaign for approval before going live.
                    </p>
                  </Reveal>
                  <Reveal direction="up" delay={800}>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to="/campaigns/create"
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/40 transition-all duration-200 hover:-translate-y-0.5 no-underline"
                      >
                        Create Campaign
                        <ArrowRight size={17} strokeWidth={2.5} />
                      </Link>
                      <a
                        href="#explore"
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/40 transition-all duration-200 hover:-translate-y-0.5 no-underline"
                      >
                        Start Donating
                      </a>
                    </div>
                  </Reveal>
                </div>

                {/* Right icon grid */}
                <div className="hidden md:flex flex-col gap-3 items-center shrink-0">
                  <Reveal cascade direction="up" delay={500}>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: <ShieldCheck size={22} className="text-blue-400" />, label: 'Verified' },
                        { icon: <LayoutGrid size={22} className="text-indigo-400" />, label: 'On-Chain' },
                        { icon: <Zap size={22} className="text-amber-400" />, label: 'Fast TX' },
                        { icon: <ArrowRight size={22} className="text-emerald-400" />, label: 'Transparent' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex flex-col items-center justify-center gap-1.5 w-24 h-24 bg-white/5 border border-white/10 rounded-2xl"
                        >
                          {item.icon}
                          <span className="text-white/60 text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Explore Section ── */}
      <section id="explore" className="px-6 md:px-16 pt-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <Reveal direction="up" threshold={0.05}>
            <div className="bg-[#1a1c23]/60 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/40 border border-white/5 p-8 md:p-12 relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

              {/* Section heading */}
              <Reveal direction="up">
                <div className="text-center mb-10 relative z-10">
                  <h2 className="text-[36px] md:text-[44px] font-black text-white tracking-tight mb-2">
                    Explore Campaigns
                  </h2>
                  <p className="text-white/60 text-lg">Support verified causes with full transparency.</p>
                </div>
              </Reveal>

              {/* Filter bar */}
              <Reveal direction="up" delay={200}>
                <div className="flex flex-wrap gap-3 items-center mb-10 p-4 bg-white/5 border border-white/10 rounded-2xl relative z-10 backdrop-blur-sm">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 rounded-xl text-sm font-medium text-white placeholder:text-white/30 border border-white/10 outline-none focus:border-blue-500/50 transition-all shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 rounded-xl text-sm font-semibold text-white/80 border border-white/10 outline-none focus:border-blue-500/50 cursor-pointer shadow-sm hover:bg-white/10 transition-colors"
                    >
                      {CATEGORIES.map((c) => <option key={c} className="bg-[#1a1c23] text-white">{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 rounded-xl text-sm font-semibold text-white/80 border border-white/10 outline-none focus:border-blue-500/50 cursor-pointer shadow-sm hover:bg-white/10 transition-colors"
                    >
                      {STATUSES.map((s) => <option key={s} className="bg-[#1a1c23] text-white">{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 rounded-xl text-sm font-semibold text-white/80 border border-white/10 outline-none focus:border-blue-500/50 cursor-pointer shadow-sm hover:bg-white/10 transition-colors"
                    >
                      {SORTS.map((s) => <option key={s} className="bg-[#1a1c23] text-white">Sort by: {s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  </div>
                </div>
              </Reveal>

              {/* States */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-28 gap-4">
                  <Loader2 size={44} className="text-blue-500 animate-spin" />
                  <p className="text-white/60 font-bold text-lg">Fetching campaigns from blockchain...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center text-center py-20 bg-red-500/5 rounded-3xl border border-red-500/20 gap-4 px-8">
                  <AlertCircle size={44} className="text-red-400" />
                  <p className="text-red-400 font-black text-xl">{error}</p>
                  <p className="text-white/40 text-sm">Please ensure you are connected to Sepolia testnet.</p>
                  <button onClick={refresh} className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                    Retry
                  </button>
                </div>
              ) : campaignAddresses.length === 0 ? (
                <div className="flex flex-col items-center text-center py-28 bg-white/5 rounded-3xl border-2 border-dashed border-white/10 gap-4">
                  <LayoutGrid size={44} className="text-white/20" />
                  <p className="text-white/80 text-xl font-bold">No campaigns found yet.</p>
                  <p className="text-white/40 text-sm">Check back soon for new impact opportunities.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <span className="text-white/50 text-sm font-semibold">
                      Showing <span className="text-white font-black">{Math.min(visibleCount, campaignAddresses.length)}</span> of <span className="text-white font-black">{campaignAddresses.length}</span> campaigns
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-black rounded-full uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Live On-Chain
                    </span>
                  </div>
                  <Reveal cascade direction="up" delay={200}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 relative z-10">
                      {displayedAddresses.map((addr) => (
                        <CampaignCard key={addr} address={addr} />
                      ))}
                    </div>
                  </Reveal>
                  {visibleCount < campaignAddresses.length && (
                    <Reveal direction="up" delay={200}>
                      <div className="mt-14 text-center relative z-10">
                        <button onClick={() => setVisibleCount((prev) => prev + 6)} className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5">
                          View More
                          <ChevronDown size={18} />
                        </button>
                      </div>
                    </Reveal>
                  )}
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
};

export default Campaigns;

