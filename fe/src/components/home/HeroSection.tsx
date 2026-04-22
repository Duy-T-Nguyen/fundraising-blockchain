import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Coins } from 'lucide-react';
import Reveal from '../common/Reveal';

const HeroSection = () => {
  return (
    <section className="px-6 md:px-16 pt-20 pb-28">
      <div className="max-w-5xl mx-auto">
        {/* Badge */}
        <Reveal direction="down" delay={200}>
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/80 text-sm font-medium tracking-wide">Live on Sepolia Testnet</span>
          </div>
        </Reveal>

        {/* Heading */}
        <Reveal direction="up" delay={400} duration={1000}>
          <h1 className="text-white text-[56px] md:text-[72px] font-black leading-[1.05] tracking-tight mb-8 max-w-3xl">
            See Where Your Donation Goes —{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #93c5fd, #60a5fa, #a5b4fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              In Real Time
            </span>
          </h1>
        </Reveal>

        <Reveal direction="up" delay={600}>
          <p className="text-white/70 text-xl font-normal max-w-xl leading-relaxed mb-12">
            Track every donation. Ensure every impact. <br />
            No middlemen. No hidden fees.
          </p>
        </Reveal>

        {/* CTA Buttons */}
        <Reveal direction="up" delay={800}>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/#campaigns"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Coins size={20} />
              Start Donating
            </Link>

            <Link
              to="/#campaigns"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5"
            >
              <ShieldCheck size={20} />
              Explore Transparent Campaigns
              <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HeroSection;
