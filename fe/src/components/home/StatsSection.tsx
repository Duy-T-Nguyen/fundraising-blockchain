import { DollarSign, Users, HeartHandshake } from 'lucide-react';

const stats = [
  { icon: DollarSign, label: 'Total Raised', value: '$23M+' },
  { icon: Users, label: 'Donors', value: '3,000+' },
  { icon: HeartHandshake, label: 'Disbursed', value: '$12M+' },
];

const StatsSection = () => {
  return (
    <section className="py-20 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-900/8 hover:shadow-2xl hover:shadow-blue-600/10 hover:-translate-y-1 transition-all duration-300 flex items-center gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                <Icon size={26} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[36px] font-black text-gray-900 tracking-tighter leading-none">{value}</div>
                <div className="text-[14px] text-gray-500 font-semibold mt-1 uppercase tracking-widest">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* On-chain Footnote */}
        <div className="mt-12 text-center">
          <p className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-full border border-blue-100 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            All data is recorded on-chain and publicly verifiable.
          </p>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
