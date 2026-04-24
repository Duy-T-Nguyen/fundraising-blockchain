import React, { useState, useEffect } from 'react';
import { Building, Globe, Save } from 'lucide-react';

interface SupplierProfileProps {
  info: any;
  isUpdating: boolean;
  onUpdate: (name: string, metadata: string) => Promise<any>;
}

export const SupplierProfile: React.FC<SupplierProfileProps> = ({
  info,
  isUpdating,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: '',
    metadata: ''
  });

  useEffect(() => {
    if (info) {
      setFormData({
        name: info.name,
        metadata: info.metadataHash || ''
      });
    }
  }, [info]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData.name, formData.metadata);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[3rem] p-12 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">

        {/* Decorative Light Ooze */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-12 relative">
          <div className="w-20 h-20 bg-blue-500/10 rounded-[2.2rem] flex items-center justify-center mb-6 shadow-2xl border border-blue-500/20 shadow-blue-500/10">
            <Building size={32} className="text-blue-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Registry Settings</h2>
          <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
            Update your global supplier identity <br />
            <span className="text-blue-400/60">Stored immutably on the blockchain.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 relative">
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-4 ml-6">
                Business Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] px-8 py-6 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-black text-lg placeholder:text-white/10"
                placeholder="Nexus Supplies Ltd."
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-4 ml-6">
                External Metadata Pointer (IPFS)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.metadata}
                  onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] px-8 py-6 pl-16 text-blue-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-mono text-sm tracking-tight placeholder:text-white/10"
                  placeholder="Qm..."
                />
                <Globe size={20} className="absolute left-7 top-1/2 -translate-y-1/2 text-white/20" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl shadow-blue-900/40 disabled:opacity-50 flex items-center justify-center gap-4 group"
            >
              <Save size={18} className="transition-transform group-hover:scale-110" />
              {isUpdating ? 'Executing On-Chain...' : 'Save Registry Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
