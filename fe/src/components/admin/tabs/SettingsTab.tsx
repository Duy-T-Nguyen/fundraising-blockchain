import React from 'react';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

interface SettingsTabProps {
  newFee: string;
  setNewFee: (val: string) => void;
  processingId: string | null;
  onUpdateFee: () => Promise<void>;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ newFee, setNewFee, processingId, onUpdateFee }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Spam Fee */}
      <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-inner">
            <AlertCircle size={20} className="text-amber-500" />
          </div>
          Anti-Spam Protocol
        </h3>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
          Set the mandatory fee for campaign creation. This prevents sybil attacks and sustains platform infrastructure costs.
        </p>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Fee (ETH)</label>
            <div className="flex gap-4">
              <input type="number" step="0.0001" value={newFee} onChange={(e) => setNewFee(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 focus:bg-white transition-all font-black text-slate-900" />
              <button
                onClick={onUpdateFee}
                disabled={!!processingId || !newFee}
                className="px-8 py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-900/10 disabled:bg-slate-100 disabled:text-slate-300 active:scale-95"
              >
                {processingId === 'update-fee' ? <Loader2 size={18} className="animate-spin" /> : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Transfer */}
      <div className="bg-red-50/50 border border-red-100 p-10 rounded-[40px] shadow-sm">
        <h3 className="text-xl font-black text-red-900 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center border border-red-200 shadow-inner">
            <ShieldCheck size={20} className="text-red-600" />
          </div>
          Privilege Control
        </h3>
        <p className="text-sm text-red-700/70 mb-8 leading-relaxed font-medium">
          <span className="font-black text-red-700 uppercase tracking-tighter">CRITICAL:</span> Transferring ownership will remove your administrative rights immediately. This action is irreversible.
        </p>
        <button className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-95">
          Transfer Master Key
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
