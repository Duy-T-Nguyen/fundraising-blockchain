import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import type { Supplier } from '../../../hooks/useAdmin';

interface SuppliersTabProps {
  suppliers: Supplier[];
  processingId: string | null;
  newSupplierAddr: string;
  setNewSupplierAddr: (val: string) => void;
  newSupplierName: string;
  setNewSupplierName: (val: string) => void;
  onAdd: () => Promise<void>;
  onRemove: (addr: string) => Promise<void>;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({
  suppliers, processingId, newSupplierAddr, setNewSupplierAddr,
  newSupplierName, setNewSupplierName, onAdd, onRemove
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to add */}
        <div className="lg:col-span-1 bg-white border border-slate-200 p-8 rounded-[40px] h-fit sticky top-28 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Whitelist Supplier</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Wallet Address</label>
              <input value={newSupplierAddr} onChange={(e) => setNewSupplierAddr(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-sm font-medium text-slate-900" placeholder="0x..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Entity Name</label>
              <input value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-sm font-medium text-slate-900" placeholder="e.g. Red Cross" />
            </div>
            <button
              onClick={onAdd}
              disabled={!!processingId || !newSupplierAddr || !newSupplierName}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-900/10 mt-4 disabled:bg-slate-100 disabled:text-slate-300 active:scale-95"
            >
              {processingId === 'add-supplier' ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Whitelist'}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Registry</h3>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
               {suppliers.length} Verified Partners
             </span>
          </div>

          <div className="grid gap-3">
            {suppliers.map(s => (
              <div key={s.address} className="p-6 bg-white border border-slate-200 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 font-black text-lg shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="text-slate-900 font-black text-lg tracking-tight leading-none mb-1.5">{s.name}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">{s.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                    <p className="text-lg font-black text-slate-900 tracking-tighter">{parseFloat(s.totalEarned).toFixed(3)} <span className="text-blue-600">ETH</span></p>
                  </div>
                  <button
                    onClick={() => onRemove(s.address)}
                    className="p-4 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-2xl transition-all border border-slate-100 hover:border-red-100"
                  >
                    {processingId === `remove-${s.address}` ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersTab;
