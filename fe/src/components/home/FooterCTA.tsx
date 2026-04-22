import { Link } from 'react-router-dom';

const FooterCTA = () => {
  return (
    <section className="py-24 px-6 md:px-12 relative overflow-hidden">
      {/* Background with specific gradient matching user's app style but focused on the bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #1e3464 0%, #4a6fa5 100%)',
          opacity: 0.95
        }}
      />

      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">
          Start Making a Transparent Impact Today
        </h2>
        <p className="text-blue-100/80 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of donors who are changing the world through the power of blockchain transparency.
        </p>
        <Link
          to="/campaigns#explore"
          className="inline-block px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-blue-900/40 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
        >
          Start Donating
        </Link>
      </div>
    </section>
  );
};

export default FooterCTA;
