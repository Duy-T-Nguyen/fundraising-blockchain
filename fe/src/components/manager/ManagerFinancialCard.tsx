import React from 'react';
import { ShieldCheck, Lock, Unlock, AlertCircle } from 'lucide-react';

interface ManagerFinancialCardProps {
  totalBalance: string;
  availableFunds: string;
  lockedFunds: string;
}

const ManagerFinancialCard: React.FC<ManagerFinancialCardProps> = ({
  totalBalance,
  availableFunds,
  lockedFunds
}) => {
  const total = parseFloat(totalBalance);
  const locked = parseFloat(lockedFunds);
  const lockedPercentage = total > 0 ? (locked / total) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/40 border border-white/10 overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-emerald-400" size={18} />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/50">Financial Integrity State</h3>
          </div>
          <p className="text-lg font-bold text-white">Budget Reservation System</p>
        </div>

        <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest text-center">Liquidity Safeguard Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Available Funds */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 relative group transition-all hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <Unlock size={20} />
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Spendable</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{availableFunds} ETH</div>
          <p className="text-xs text-white/40 font-medium lowercase">available for new requests</p>
        </div>

        {/* Locked Funds */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 relative group transition-all hover:shadow-lg hover:shadow-indigo-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <Lock size={20} />
            </div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Reserved</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{lockedFunds} ETH</div>
          <p className="text-xs text-white/40 font-medium lowercase">locked for pending requests/milestones</p>
        </div>
      </div>

      {/* Total Balance Info */}
      <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold justify-center pt-2 italic">
        <AlertCircle size={12} />
        Total Campaign Balance: {totalBalance} ETH
      </div>
    </div>
  );
};

export default ManagerFinancialCard;
