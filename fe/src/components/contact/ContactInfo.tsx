import { Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

const ContactInfo = () => {
  const infoItems = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'support@charitychain.com',
      desc: 'Our support team responds within 24 hours.'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Digital Nomads / Remote',
      desc: 'Operated by a global decentralized team.'
    },
    {
      icon: Clock,
      title: 'Support Hours',
      value: '24/7 Monitoring',
      desc: 'On-chain activity is watched round the clock.'
    }
  ];

  return (
    <div className="space-y-6">
      {infoItems.map((item) => (
        <div key={item.title} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/10 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <item.icon className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">{item.title}</h3>
              <p className="text-blue-100/90 font-medium text-lg mb-1">{item.value}</p>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md mt-10">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck className="text-emerald-400" size={20} />
          <h4 className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">Verified Support</h4>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          We will never ask for your private key or seed phrase. All official communications will come from our verified domain.
        </p>
      </div>
    </div>
  );
};

export default ContactInfo;
