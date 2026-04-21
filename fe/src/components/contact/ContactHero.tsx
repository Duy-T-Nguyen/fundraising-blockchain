

const ContactHero = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/20 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
            Get in Touch
          </span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
          We're Here to <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Support</span> Your Impact
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          Have questions about the platform, or need help with a campaign? Our team is dedicated to ensuring your fundraising journey is seamless and transparent.
        </p>
      </div>
    </section>
  );
};

export default ContactHero;
