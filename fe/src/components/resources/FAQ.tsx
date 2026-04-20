import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'How do I donate to a campaign?',
    answer: 'Simply connect your MetaMask wallet, browse to a campaign, and click "Donate". You will need some Sepolia ETH for gas and the donation amount.'
  },
  {
    question: 'Can I create my own campaign?',
    answer: 'Yes! Navigate to the "Create Project" page. You will need to provide a title, description, funding goal, and the manager\'s wallet address. Once submitted, your campaign will be deployed as a new smart contract.'
  },
  {
    question: 'How are my funds protected?',
    answer: 'Your funds are held in escrow by the smart contract. They cannot be withdrawn by the campaign manager until they create a "Spending Request" that is approved by a majority of the contributors.'
  },
  {
    question: 'Who approves fund disbursement?',
    answer: 'The donors (contributors) approve disbursements. Every request must receive more than 50% "Yes" votes based on the value contributed by the voters to succeed.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-6 bg-[#0f1115]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">Common Questions</h2>
          <p className="text-slate-400">Everything you need to know about the platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`rounded-2xl border transition-all duration-300 ${
                openIndex === index 
                ? 'bg-white/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-8 py-6 flex items-center justify-between"
              >
                <span className={`font-bold transition-colors ${openIndex === index ? 'text-blue-400' : 'text-white'}`}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="text-blue-400" size={20} />
                ) : (
                  <ChevronDown className="text-slate-500" size={20} />
                )}
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-8 pb-8 text-slate-400 text-[15px] leading-relaxed border-t border-white/5 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
