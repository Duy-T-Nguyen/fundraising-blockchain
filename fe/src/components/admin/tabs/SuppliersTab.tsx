import React from 'react';
import { Loader2, Trash2, ChevronDown, X, ImagePlus } from 'lucide-react';
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

  const inputClass = "w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium text-white placeholder-white/20";
  const labelClass = "block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2.5";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to add */}
        <div className="lg:col-span-1 bg-gradient-to-tr from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/20 p-8 rounded-[2.5rem] h-fit sticky top-28 shadow-xl shadow-emerald-900/10 backdrop-blur-xl">
          <h3 className="text-xl font-black text-white mb-6 tracking-tight">Whitelist Supplier</h3>
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Wallet Address</label>
              <input value={newSupplierAddr} onChange={(e) => setNewSupplierAddr(e.target.value)}
                className={inputClass} placeholder="0x..." />
            </div>
            <div>
              <label className={labelClass}>Entity Name</label>
              <input value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)}
                className={inputClass} placeholder="e.g. Red Cross" />
            </div>
            <div>
              <label className={labelClass}>Biography & Credibility</label>
              <textarea value={newSupplierBio} onChange={(e) => setNewSupplierBio(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`} placeholder="Describe their experience and history..." />
            </div>
            <div>
              <label className={labelClass}>Evidence (Logo/License)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden ${preview ? 'border-blue-400/60 bg-blue-500/10' : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25'}`}
              >
                {preview ? (
                  <>
                    <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Preview" />
                    <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest relative z-10">Image Selected</span>
                    <span className="text-[9px] text-white/30 relative z-10">Click to change</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="text-white/25" size={20} />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Upload File</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" accept="image/*" />
              </div>
            </div>

            <button
              onClick={onAdd}
              disabled={!!processingId || !newSupplierAddr || !newSupplierName || !newSupplierBio || !newSupplierFile}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/20 mt-4 disabled:opacity-40 active:scale-95"
            >
              {processingId === 'add-supplier' ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Whitelist'}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-white tracking-tight">Active Registry</h3>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              {suppliers.length} Verified Partners
            </span>
          </div>

          <div className="grid gap-3">
            {suppliers.map(s => {
              const isExpanded = expandedAddr === s.address;
              return (
                <div key={s.address} className="overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-white/10 rounded-3xl shadow-xl shadow-blue-900/10 hover:border-white/20 transition-all backdrop-blur-xl">
                  <div
                    onClick={() => setExpandedAddr(isExpanded ? null : s.address)}
                    className="p-6 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-300 border border-blue-500/20 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors overflow-hidden">
                        {s.image ? (
                          <img src={s.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} className="w-full h-full object-cover" alt="" />
                        ) : s.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-black text-lg tracking-tight leading-none">{s.name}</p>
                          <ChevronDown size={14} className={`text-white/30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        <p className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-tighter mt-1">
                          {s.address.slice(0, 6)}...{s.address.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Earned</p>
                        <p className="text-lg font-black text-white tracking-tighter">{parseFloat(s.totalEarned).toFixed(3)} <span className="text-blue-400">ETH</span></p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove(s.address); }}
                        className="p-4 bg-white/5 hover:bg-red-500/15 text-white/20 hover:text-red-400 rounded-2xl transition-all border border-white/10 hover:border-red-500/20"
                      >
                        {processingId === `remove-${s.address}` ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10">
                        <div className="md:col-span-3">
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Biography & History</p>
                          <p className="text-sm font-medium text-white/50 leading-relaxed italic">
                            "{s.biography || 'No biography provided for this supplier.'}"
                          </p>
                        </div>
                        <div className="md:col-span-1">
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Verification</p>
                          <div
                            onClick={() => s.image && setSelectedImage(s.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'))}
                            className="aspect-square rounded-xl bg-white/5 border border-white/10 p-2 overflow-hidden group/img cursor-zoom-in"
                          >
                            {s.image ? (
                              <img src={s.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} className="w-full h-full object-cover rounded-lg group-hover/img:scale-110 transition-transform duration-500" alt="Verification" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20 italic text-[10px]">No proof</div>
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
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
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
