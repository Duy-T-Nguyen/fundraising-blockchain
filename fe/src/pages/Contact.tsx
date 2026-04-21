import { useEffect } from 'react';
import ContactHero from '../components/contact/ContactHero';
import ContactInfo from '../components/contact/ContactInfo';
import ContactForm from '../components/contact/ContactForm';
import ContactSocials from '../components/contact/ContactSocials';

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


      </div>
    </div>
  );
};

export default Contact;
