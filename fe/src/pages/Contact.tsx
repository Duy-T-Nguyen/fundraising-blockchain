import { useEffect } from 'react';
import ContactHero from '../components/contact/ContactHero';
import ContactInfo from '../components/contact/ContactInfo';
import ContactForm from '../components/contact/ContactForm';
import ContactSocials from '../components/contact/ContactSocials';
import FooterCTA from '../components/home/FooterCTA';
import { Beaker } from 'lucide-react';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#0f1115] min-h-screen">
      <ContactHero />
      
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-24">
          {/* Left: Contact Info */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <ContactInfo />
          </div>
          
          {/* Right: Contact Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <ContactForm />
          </div>
        </div>

        <ContactSocials />

        {/* CTA section added here */}
        <div className="mt-24">
          <FooterCTA />
        </div>

        {/* Research Prototype Disclaimer */}
        <div className="mt-12 p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 flex flex-col md:flex-row items-center gap-6 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center shrink-0">
            <Beaker className="text-blue-400" size={24} />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-white font-bold text-lg mb-1">Academic Research Prototype</h4>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              This platform is a research prototype for transparent fundraising using blockchain. 
              The project explores how decentralized protocols can eliminate trust gaps in charitable giving. 
              All transactions occur on the Sepolia testnet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
