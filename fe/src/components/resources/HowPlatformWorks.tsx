import React from 'react';
import { PlusCircle, Wallet, Vote, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: PlusCircle,
    color: 'bg-blue-500',
    title: 'Create Campaign',
    role: 'Manager',
    description: 'Managers define goals, deadlines, and smart contract parameters. Once deployed, the campaign is immutable and transparent.',
  },
  {
    icon: Wallet,
    color: 'bg-teal-500',
    title: 'Secure Donation',
    role: 'Donor',
    description: 'Donors contribute ETH directly via MetaMask. Funds are held securely in the campaign\'s smart contract escrow, not by us.',
  },
  {
    icon: Vote,
    color: 'bg-purple-500',
    title: 'Democratic Voting',
    role: 'Contributors',
    description: 'Managers create "Requests" to spend funds. Donors vote to approve or reject these requests based on proof of progress.',
  },
  {
    icon: CheckCircle,
    color: 'bg-orange-500',
    title: 'Funds Released',
    role: 'Smart Contract',
    description: 'Only once more than 50% of the value votes "Yes", the smart contract automatically releases funds to the specified recipient.',
  },
];

const HowPlatformWorks = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A decentralized lifecycle designed for maximum accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="absolute top-4 right-8 text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                0{index + 1}
              </div>
              
              <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="text-white" size={28} />
              </div>

              <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">
                {step.role}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowPlatformWorks;
