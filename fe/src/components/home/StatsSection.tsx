import { Users, HeartHandshake } from 'lucide-react';
import EthIcon from '../common/EthIcon';
import Reveal from '../common/Reveal';

const stats = [
  { icon: EthIcon, label: 'Total Raised', value: '4,250 ETH' },
  { icon: Users, label: 'Donors', value: '3,000+' },
  { icon: HeartHandshake, label: 'Disbursed', value: '2,100 ETH' },
];

const StatsSection = () => {
  return (
    <section className="py-20 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <Reveal cascade direction="up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl shadow-black/20 hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex items-center gap-6"
              >
                <div className="w-14 h-14 flex items-center justify-center shrink-0">
                  <Icon size={40} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-[36px] font-black text-white tracking-tighter leading-none">{value}</div>
                  <div className="text-[14px] text-white/50 font-semibold mt-1 uppercase tracking-widest">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* On-chain Footnote */}
        <Reveal direction="up" delay={500}>
          <div className="mt-12 text-center">
            <p className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 text-sm font-bold rounded-full border border-blue-500/20 shadow-lg shadow-blue-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              All data is recorded on-chain and publicly verifiable.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default StatsSection;
