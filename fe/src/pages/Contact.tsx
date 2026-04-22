import ContactHero from '../components/contact/ContactHero';
import ContactInfo from '../components/contact/ContactInfo';
import ContactForm from '../components/contact/ContactForm';
import ContactSocials from '../components/contact/ContactSocials';
import Reveal from '../components/common/Reveal';

const Contact = () => {
  return (
    <div className="bg-[#0f1115] min-h-screen">
      <Reveal direction="none">
        <ContactHero />
      </Reveal>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-24">
          {/* Left: Contact Info */}
          <Reveal direction="left" className="lg:col-span-2 order-2 lg:order-1">
            <ContactInfo />
          </Reveal>

          {/* Right: Contact Form */}
          <Reveal direction="right" className="lg:col-span-3 order-1 lg:order-2">
            <ContactForm />
          </Reveal>
        </div>

        <Reveal direction="up">
          <ContactSocials />
        </Reveal>
      </div>
    </div>
  );
};

export default Contact;
