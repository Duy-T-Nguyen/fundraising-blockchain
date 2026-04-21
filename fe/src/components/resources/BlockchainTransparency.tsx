
import { Eye, ShieldCheck, Database, ExternalLink } from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Public Oversight',
    description: 'Every single donation and transaction is recorded on the Ethereum (Sepolia) blockchain. Anyone, anywhere, can audit the flow of funds.'
  },
  {
    icon: ShieldCheck,
    title: 'Immutable Logic',
    description: 'Platform rules are encoded in Smart Contracts. No one, not even the platform administrators, can bypass the voting process or divert funds.'
  },
  {
    icon: Database,
    title: 'Permanent Records',
    description: 'Transaction history is stored permanently and is tamper-proof. Proof of donations remains forever as proof of your contribution.'
  }
];

const BlockchainTransparency = () => {
  return (
    <section className="py-24 px-6 relative bg-gradient-to-b from-[#0f1115] to-[#1a1c22]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-4xl font-black text-white mb-6">
              Full Spectrum <br />
              <span className="text-teal-400">Blockchain Transparency</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              We leverage the power of decentralization to eliminate trust issues in charity. 
              By removing intermediaries, we ensure that the maximum possible value reaches those in need.
            </p>
            
            <div className="space-y-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="mt-1 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <feature.icon className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{feature.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="p-8 rounded-[40px] bg-gradient-to-br from-blue-600/20 to-teal-500/20 border border-white/10 backdrop-blur-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Database size={120} className="text-white" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-4">On-Chain Verification</h3>
                <p className="text-slate-200 text-sm mb-8 leading-relaxed">
                  Want to see the code? Our smart contracts are verified on Etherscan. 
                  You can inspect the source code, check current balances, and view historical transactions directly.
                </p>
                
                <a 
                  href="https://sepolia.etherscan.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-950 font-bold rounded-2xl hover:bg-teal-400 transition-all hover:scale-105"
                >
                  View on Etherscan
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlockchainTransparency;
