import React from 'react';

const ResourcesHero = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/20 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
            Platform Protocol & Guide
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-8">
          Trust, <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Transparency</span> <br />
          & Decentralized Impact
        </h1>
        
        <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed mb-10">
          Explore how our blockchain infrastructure ensures every donation is tracked, every request is voted on, and every cent is accounted for.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button className="px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
            Get Started
          </button>
          <button className="px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-2xl transition-all hover:bg-white/10">
            View Whitepaper
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResourcesHero;
