import React from 'react';
import { Loader2, Trash2, ChevronDown, X } from 'lucide-react';
import type { Supplier } from '../../../hooks/useAdmin';

interface SuppliersTabProps {
  suppliers: Supplier[];
  processingId: string | null;
  newSupplierAddr: string;
  setNewSupplierAddr: (val: string) => void;
  newSupplierName: string;
  setNewSupplierName: (val: string) => void;
  newSupplierBio: string;
  setNewSupplierBio: (val: string) => void;
  newSupplierFile: File | null;
  setNewSupplierFile: (file: File | null) => void;
  onAdd: () => Promise<void>;
  onRemove: (addr: string) => Promise<void>;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({
  suppliers, processingId, newSupplierAddr, setNewSupplierAddr,
  newSupplierName, setNewSupplierName, 
  newSupplierBio, setNewSupplierBio,
  newSupplierFile, setNewSupplierFile,
  onAdd, onRemove
}) => {
  const [expandedAddr, setExpandedAddr] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSupplierFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to add */}
        <div className="lg:col-span-1 bg-white border border-slate-200 p-8 rounded-[40px] h-fit sticky top-28 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Whitelist Supplier</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Wallet Address</label>
              <input value={newSupplierAddr} onChange={(e) => setNewSupplierAddr(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-sm font-medium text-slate-900" placeholder="0x..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Entity Name</label>
              <input value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-sm font-medium text-slate-900" placeholder="e.g. Red Cross" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Biography & Credibility</label>
              <textarea value={newSupplierBio} onChange={(e) => setNewSupplierBio(e.target.value)}
                rows={4}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-sm font-medium text-slate-900 resize-none" placeholder="Describe their experience and history..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Evidence (Logo/License)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden ${preview ? 'border-blue-400' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}`}
              >
                {preview ? (
                  <>
                    <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Preview" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest relative z-10">Image Selected</span>
                    <span className="text-[9px] text-slate-400 relative z-10">Click to change</span>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Loader2 className="text-slate-300" size={16} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload File</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" accept="image/*" />
              </div>
            </div>

            <button
              onClick={onAdd}
              disabled={!!processingId || !newSupplierAddr || !newSupplierName || !newSupplierBio || !newSupplierFile}
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
            {suppliers.map(s => {
              const isExpanded = expandedAddr === s.address;
              return (
                <div key={s.address} className="overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all">
                  <div 
                    onClick={() => setExpandedAddr(isExpanded ? null : s.address)}
                    className="p-6 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 font-black text-lg shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors overflow-hidden">
                        {s.image ? (
                          <img src={s.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} className="w-full h-full object-cover" alt="" />
                        ) : s.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-slate-900 font-black text-lg tracking-tight leading-none">{s.name}</p>
                          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter mt-1">
                          {s.address.slice(0, 6)}...{s.address.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter">{parseFloat(s.totalEarned).toFixed(3)} <span className="text-blue-600">ETH</span></p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove(s.address); }}
                        className="p-4 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-2xl transition-all border border-slate-100 hover:border-red-100"
                      >
                        {processingId === `remove-${s.address}` ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="md:col-span-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Biography & History</p>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                            "{s.biography || 'No biography provided for this supplier.'}"
                          </p>
                        </div>
                        <div className="md:col-span-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verification</p>
                          <div 
                            onClick={() => s.image && setSelectedImage(s.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'))}
                            className="aspect-square rounded-xl bg-white border border-slate-200 p-2 shadow-inner overflow-hidden group/img cursor-zoom-in"
                          >
                            {s.image ? (
                              <img src={s.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} className="w-full h-full object-cover rounded-lg group-hover/img:scale-110 transition-transform duration-500" alt="Verification" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-[10px]">No proof</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" 
            alt="Evidence Full View"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default SuppliersTab;
