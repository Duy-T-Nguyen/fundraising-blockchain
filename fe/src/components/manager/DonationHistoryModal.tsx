import React from 'react';
import { X, Coins, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import type { UserDonation } from '../../hooks/useUserActivity';

interface DonationHistoryModalProps {
  donations: UserDonation[];
  onClose: () => void;
}

const DonationHistoryModal: React.FC<DonationHistoryModalProps> = ({ donations, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
      {/* Glass Container */}
      <div className="relative w-full max-w-4xl bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Full Contribution History</h2>
              <p className="text-blue-600 text-xs font-black uppercase tracking-widest mt-0.5 flex items-center gap-2">
                <Heart size={12} fill="currentColor" /> Verified on Blockchain
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all shadow-sm border border-gray-100 active:scale-95"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {donations.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Coins size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold italic">You haven't made any contributions yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Campaign</th>
                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {donations.map((don, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-5 px-8">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{don.campaignName}</span>
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5">{don.campaignAddress.slice(0, 10)}...{don.campaignAddress.slice(-8)}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-md">{don.amount} ETH</span>
                          <span className="text-[10px] font-bold text-slate-400">Ethereum Network</span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                          {don.timestamp}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <a 
                          href={`https://sepolia.etherscan.io/address/${don.campaignAddress}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs hover:underline"
                        >
                          Etherscan <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Contributions</p>
            <p className="text-2xl font-black">{donations.length} Support Projects</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Aggregate Impact</p>
            <p className="text-2xl font-black text-blue-400">
              {donations.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(4)} ETH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationHistoryModal;
