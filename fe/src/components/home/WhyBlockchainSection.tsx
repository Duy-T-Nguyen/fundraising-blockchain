import { Eye, Lock, BarChart3 } from 'lucide-react';
import Reveal from '../common/Reveal';

const features = [
  {
    icon: Eye,
    title: 'Transparent',
    description: 'Every transaction is publicly verifiable on-chain. No black boxes, no hidden fees.',
  },
  {
    icon: Lock,
    title: 'Trustless',
    description: 'Smart contracts automate fund disbursement — no intermediaries can touch your donation.',
  },
  {
    icon: BarChart3,
    title: 'Trackable',
    description: 'Monitor fund usage in real-time and see exactly where every ETH goes.',
  },
];

const WhyBlockchainSection = () => {
  return (
    <section className="py-24 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <Reveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-[40px] font-black text-white tracking-tight mb-4">
              Why Blockchain?
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              A new standard for charity — built on openness, automation, and accountability.
            </p>
          </div>
        </Reveal>

        <Reveal cascade direction="up" delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-600/15 hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Icon + Title same row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={22} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-[20px] font-black text-gray-900">{title}</h3>
                </div>

                <p className="text-gray-500 leading-relaxed text-[15px]">{description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default WhyBlockchainSection;
