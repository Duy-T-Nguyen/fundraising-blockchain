import React from 'react';
import { Coins, Calendar, User, Loader2 } from 'lucide-react';
import { useDonations } from '../../hooks/useDonations';

interface DonorsTableProps {
  address?: string;
  refreshTrigger?: number;
}

const DonorsTable: React.FC<DonorsTableProps> = ({ address: propsAddress, refreshTrigger }) => {
  const { donations, isLoading, refresh } = useDonations(propsAddress || undefined);

  React.useEffect(() => {
    if (refreshTrigger) refresh();
  }, [refreshTrigger, refresh]);

  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="rounded-[2rem] overflow-hidden border border-cyan-500/15 bg-gradient-to-bl from-slate-900 via-[#0a2030] to-slate-900 backdrop-blur-xl shadow-2xl shadow-cyan-900/20">
      {/* Header */}
      <div className="bg-white/5 py-6 px-10 flex justify-between items-center border-b border-white/10">
        <h2 className="text-xl font-black text-white tracking-widest uppercase">
          Donation History
        </h2>
        <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest">
          {donations.length} Contributions
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="py-5 px-10 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Asset</th>
              <th className="py-5 px-10 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Amount</th>
              <th className="py-5 px-10 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Donor</th>
              <th className="py-5 px-10 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-400" size={32} />
                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Retrieving logs...</span>
                  </div>
                </td>
              </tr>
            ) : donations.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <span className="text-sm font-bold text-white/40 italic">No donations yet. Be the first!</span>
                </td>
              </tr>
            ) : (
              donations.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center">
                        <Coins className="text-amber-400" size={14} />
                      </div>
                      <span className="font-bold text-white/70 text-sm">ETH</span>
                    </div>
                  </td>
                  <td className="py-6 px-10">
                    <span className="font-black text-white text-[16px]">{item.amount}</span>
                  </td>
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs bg-blue-500/15 px-3 py-1.5 rounded-lg w-fit">
                      <User size={12} strokeWidth={3} />
                      {shortenAddress(item.donor)}
                    </div>
                  </td>
                  <td className="py-6 px-10 text-white/50 font-bold text-[11px] text-right">
                    <div className="inline-flex items-center gap-2">
                      <Calendar size={12} />
                      {item.timestamp}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonorsTable;
