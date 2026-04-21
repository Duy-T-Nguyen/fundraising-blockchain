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
      <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/20">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-blue-100">
            <Building size={32} className="text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Registry Settings</h2>
          <p className="text-slate-500 text-sm max-w-sm font-medium">Update your global supplier identity stored on the blockchain.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">
                Business Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-5 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-lg"
                placeholder="Nexus Supplies Ltd."
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">
                External Metadata Pointer (IPFS)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.metadata}
                  onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-5 pl-16 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono text-sm"
                  placeholder="Qm..."
                />
                <Globe size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-4 group"
            >
              <Save size={18} className="transition-transform group-hover:scale-110" />
              {isUpdating ? 'Executing Transaction...' : 'Save Registry Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
