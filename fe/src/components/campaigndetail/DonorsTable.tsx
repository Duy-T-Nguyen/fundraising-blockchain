import React from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, Coins, Calendar, MessageSquare, User, Loader2 } from 'lucide-react';
import { useDonations } from '../../hooks/useDonations';

const DonorsTable: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { donations, isLoading } = useDonations(address);

  const shortenAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 bg-white">
      {/* Header */}
      <div className="bg-[#1e293b] py-6 px-10 flex justify-between items-center">
        <h2 className="text-xl font-black text-white tracking-widest uppercase">
          Donation History
        </h2>
        <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
          {donations.length} Contributions
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-5 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset</th>
              <th className="py-5 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
              <th className="py-5 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Donor</th>
              <th className="py-5 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Retrieving logs...</span>
                  </div>
                </td>
              </tr>
            ) : donations.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <span className="text-sm font-bold text-gray-400 italic">No donations yet. Be the first!</span>
                </td>
              </tr>
            ) : (
              donations.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100/50 flex items-center justify-center">
                        <Coins className="text-amber-600" size={14} />
                      </div>
                      <span className="font-bold text-gray-700 text-sm">ETH</span>
                    </div>
                  </td>
                  <td className="py-6 px-10">
                    <span className="font-black text-gray-900 text-[16px]">{item.amount}</span>
                  </td>
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                      <User size={12} strokeWidth={3} />
                      {shortenAddress(item.donor)}
                    </div>
                  </td>
                  <td className="py-6 px-10 text-gray-500 font-bold text-[11px] text-right">
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
