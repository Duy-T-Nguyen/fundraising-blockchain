import { Search, Wallet, Activity } from 'lucide-react';
import Reveal from '../common/Reveal';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Choose a Campaign',
    description: 'Browse verified campaigns deployed directly as smart contracts on Sepolia. Full transparency guaranteed.',
  },
  {
    icon: Wallet,
    number: '02',
    title: 'Donate Crypto',
    description: 'Connect your MetaMask wallet and send ETH directly to the campaign contract. No middlemen.',
  },
  {
    icon: Activity,
    number: '03',
    title: 'Track Impact On-chain',
    description: 'Watch every fund movement in real-time on-chain. Every transaction is permanently recorded.',
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <Reveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-[40px] font-black text-white tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Three simple steps to make a verified, on-chain impact.
            </p>
          </div>
        </Reveal>

        <Reveal cascade direction="up" delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className="group bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl shadow-black/20 hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Step number */}
                <div className="text-[11px] font-black text-blue-400 tracking-[0.2em] uppercase mb-4">
                  Step {index + 1}
                </div>

                {/* Icon + Title same row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={22} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-[20px] font-black text-white">{title}</h3>
                </div>

                <p className="text-white/60 leading-relaxed text-[15px]">{description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorksSection;
