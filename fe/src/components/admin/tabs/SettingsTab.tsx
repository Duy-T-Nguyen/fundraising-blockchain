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
      <div className="bg-gradient-to-tr from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/20 p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/10 backdrop-blur-xl">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center border border-amber-500/20">
            <AlertCircle size={20} className="text-amber-400" />
          </div>
          Anti-Spam Protocol
        </h3>
        <p className="text-sm text-white/40 mb-8 leading-relaxed font-medium">
          Set the mandatory fee for campaign creation. This prevents sybil attacks and sustains platform infrastructure costs.
        </p>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Service Fee (ETH)</label>
            <div className="flex gap-4">
              <input
                type="number"
                step="0.0001"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all font-black text-white placeholder-white/20"
              />
              <button
                onClick={onUpdateFee}
                disabled={!!processingId || !newFee}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white font-black rounded-2xl transition-all shadow-xl shadow-amber-600/20 disabled:opacity-40 active:scale-95"
              >
                {processingId === 'update-fee' ? <Loader2 size={18} className="animate-spin" /> : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-to-tl from-slate-900 via-red-950/30 to-slate-900 border border-red-500/20 p-10 rounded-[2.5rem] shadow-xl shadow-red-900/10 backdrop-blur-xl">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center border border-red-500/20">
            <ShieldCheck size={20} className="text-red-400" />
          </div>
          Privilege Control
        </h3>
        <p className="text-sm text-white/40 mb-8 leading-relaxed font-medium">
          <span className="font-black text-red-400 uppercase tracking-tighter">CRITICAL:</span> Transferring ownership will remove your administrative rights immediately. This action is irreversible.
        </p>
        <button className="w-full py-5 bg-gradient-to-r from-red-700 to-rose-700 hover:brightness-110 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-95">
          Transfer Master Key
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
