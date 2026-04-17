import React from 'react';
import { ChevronRight, Coins, Calendar, MessageSquare, User } from 'lucide-react';

interface DonorEntry {
  id: string;
  currency: string;
  amount: string;
  donor: string;
  date: string;
  message: string;
}

const mockDonors: DonorEntry[] = [
  {
    id: '1',
    currency: 'ETH',
    amount: '0.5',
    donor: '0x71C...3921',
    date: '2024-04-12 14:22:15',
    message: 'Good luck with the project! Hope this helps.',
  },
  {
    id: '2',
    currency: 'ETH',
    amount: '1.2',
    donor: '0x3A2...fE90',
    date: '2024-04-15 09:44:21',
    message: 'Supporting education for all.',
  },
  {
    id: '3',
    currency: 'ETH',
    amount: '0.05',
    donor: 'anonymous',
    date: '2024-04-16 18:10:05',
    message: '-',
  },
  {
    id: '4',
    currency: 'ETH',
    amount: '2.0',
    donor: '0xBc9...7a1D',
    date: '2024-04-17 11:05:33',
    message: 'Glad to be part of this initiative!',
  },
];

const DonorsTable: React.FC = () => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl mt-10 border border-blue-600/20 bg-white">
      {/* Header matching Image 1 */}
      <div className="bg-blue-600 py-5 px-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Donors
        </h2>
        <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors border border-white/20">
          View More
        </button>
      </div>

      {/* Table Section matching Image 2 style */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="py-4 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Currency</th>
              <th className="py-4 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">Amount</th>
              <th className="py-4 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">Donor</th>
              <th className="py-4 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-right">Date</th>
              <th className="py-4 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-right hidden lg:table-cell">Message</th>
              <th className="py-4 px-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockDonors.map((donor) => (
              <tr key={donor.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="py-5 px-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Coins className="text-amber-600" size={16} />
                    </div>
                    <span className="font-bold text-gray-700">{donor.currency}</span>
                  </div>
                </td>
                <td className="py-5 px-8">
                  <span className="font-black text-gray-900">{donor.amount}</span>
                </td>
                <td className="py-5 px-8">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <User size={14} className="text-blue-400" />
                    {donor.donor}
                  </div>
                </td>
                <td className="py-5 px-8 text-gray-500 font-mono text-xs md:text-right">
                  <div className="inline-flex items-center gap-2">
                    <Calendar size={12} />
                    {donor.date}
                  </div>
                </td>
                <td className="py-5 px-8 text-gray-400 text-sm italic lg:table-cell hidden text-center md:text-right">
                  <div className="inline-flex items-center gap-2">
                    <MessageSquare size={12} />
                    {donor.message}
                  </div>
                </td>
                <td className="py-5 px-4 text-gray-300">
                  <ChevronRight size={18} className="group-hover:text-blue-500 transition-colors cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonorsTable;
