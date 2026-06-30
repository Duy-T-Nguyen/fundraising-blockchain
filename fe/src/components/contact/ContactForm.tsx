import React, { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';

const ContactForm = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    const subject = encodeURIComponent(`Contact Inquiry from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    const mailtoUrl = `mailto:duynguyen.das@gmail.com?subject=${subject}&body=${body}`;
    
    // Use a small timeout to ensure the sending state is visible
    setTimeout(() => {
      // Try to open email client in a new tab/window (standard practice for external protocols)
      window.open(mailtoUrl, '_blank');

      // Show success state after a longer delay to let the browser process the mailto
      setTimeout(() => {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      }, 500);
    }, 500);
  };

  if (status === 'success') {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-2xl">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="text-emerald-400" size={40} />
        </div>
        <h3 className="text-3xl font-black text-white mb-4">Message Received!</h3>
        <p className="text-slate-400 max-w-sm">
          Thank you for reaching out. A team member will review your message and get back to you shortly.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-3xl font-black text-white mb-8">Send a Message</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">
              Full Name
            </label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">
              Email Address
            </label>
            <input 
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">
              Your Message
            </label>
            <textarea 
              required
              rows={5}
              placeholder="How can we help you?"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black tracking-wide text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
          >
            {status === 'sending' ? (
              <><Loader2 className="animate-spin" size={24} /> Sending...</>
            ) : (
              <><Send size={20} /> Send Message</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
