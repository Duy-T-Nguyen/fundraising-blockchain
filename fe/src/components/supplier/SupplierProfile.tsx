import React, { useState, useEffect, useRef } from 'react';
import { Building, Globe, Save, ShieldCheck, MapPin, ExternalLink, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { fetchIPFSJSON } from '../../utils/ipfs';
import { useWallet } from '../../hooks/useWallet';

interface SupplierProfileProps {
  info: any;
  isUpdating: boolean;
  onUpdate: (name: string, metadata: string) => Promise<any>;
}

export const SupplierProfile: React.FC<SupplierProfileProps> = ({
  info,
  isUpdating,
  onUpdate
}) => {
  const { address, isConnected } = useWallet();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [imageHash, setImageHash] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing metadata from IPFS
  useEffect(() => {
    const loadMetadata = async () => {
      if (info?.name) setName(info.name);
      
      if (info?.metadataHash) {
        setIsLoadingMetadata(true);
        try {
          const data = await fetchIPFSJSON(info.metadataHash);
          if (data) {
            setBio(data.bio || '');
            const img = data.image || '';
            setImageHash(img);
            if (img) {
              setPreviewUrl(`https://ipfs.io/ipfs/${img.replace('ipfs://', '')}`);
            }
          }
        } catch (error) {
          console.error("Failed to fetch metadata:", error);
        } finally {
          setIsLoadingMetadata(false);
        }
      }
    };
    loadMetadata();
  }, [info]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address || !window.ethereum) {
      alert("Please connect your wallet first");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 1. Sign message for Backend verification
      const message = 'FundChain IPFS Upload';
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      let currentImageHash = imageHash;

      // 2. Upload Image if new file selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('address', address);
        formData.append('signature', signature as string);

        const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evidence/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error("Image upload failed");
        
        const data = await uploadRes.json();
        if (!data.cid) throw new Error("No CID returned from image upload");
        currentImageHash = `ipfs://${data.cid}`;
      }

      // 3. Bundle Bio & Image into Metadata JSON
      const metadataObj = {
        bio: bio,
        image: currentImageHash
      };

      // 4. Upload Metadata JSON using the correct /metadata endpoint
      const metaUploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evidence/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: metadataObj,
          address,
          signature,
        }),
      });

      if (!metaUploadRes.ok) {
        const errData = await metaUploadRes.json();
        throw new Error(errData.message || "Metadata upload failed");
      }

      const metaData = await metaUploadRes.json();
      if (!metaData.cid) throw new Error("No CID returned from metadata upload");
      
      const finalMetadataHash = metaData.cid;

      // 5. Update Smart Contract
      await onUpdate(name, finalMetadataHash);
      
    } catch (error: any) {
      console.error("Save failed:", error);
      if (error.code === 4001) {
        alert("Transaction rejected by user.");
      } else {
        alert(`Error: ${error.message || "Failed to update profile"}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Side: Settings Form */}
        <div className="bg-slate-900/60 border border-white/10 rounded-[3rem] p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
              <Globe size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Registry Settings</h2>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Global Identity on Blockchain</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Display Name */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-4 ml-6 italic">
                Business Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] px-8 py-5 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-black text-lg placeholder:text-white/5"
                placeholder="Nexus Supplies Ltd."
              />
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-4 ml-6 italic">
                Business Logo / Avatar
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/1] bg-white/5 border border-white/10 border-dashed rounded-[1.8rem] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 hover:border-blue-500/30 transition-all group/upload overflow-hidden relative"
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-40 group-hover/upload:opacity-60 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white shadow-2xl">
                      <ImageIcon size={24} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Change Photo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-white/20 group-hover/upload:text-blue-400 transition-colors" />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Upload Business Image</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
            </div>

            {/* Biography */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-4 ml-6 italic">
                Business Biography
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] px-8 py-6 text-blue-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium text-sm leading-relaxed placeholder:text-white/5 resize-none"
                placeholder="Tell us about your business services and expertise..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isUpdating || isUploading}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl shadow-blue-900/40 disabled:opacity-50 flex items-center justify-center gap-4 group"
              >
                {isUpdating || isUploading ? (
                  <><Loader2 size={18} className="animate-spin" /> Finalizing Profile...</>
                ) : (
                  <><Save size={18} className="transition-transform group-hover:scale-110" /> Save Profile Changes</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Profile Preview */}
        <div className="sticky top-8">
          <div className="mb-6 flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">Live Profile Preview</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Public View</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-white/10 rounded-[3rem] p-1 bg-white/5 shadow-2xl overflow-hidden group">
            <div className="bg-slate-900/80 rounded-[2.8rem] p-10 backdrop-blur-2xl relative overflow-hidden">
              {isLoadingMetadata && (
                 <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center">
                    <Loader2 className="text-blue-500 animate-spin" size={32} />
                 </div>
              )}

              {/* Profile Top Bar */}
              <div className="flex items-start justify-between mb-10">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-[2.2rem] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building size={32} className="text-white/20" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-xl border-4 border-slate-900 flex items-center justify-center text-white">
                    <ShieldCheck size={14} />
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                   <MapPin size={12} className="text-blue-400" />
                   <span className="text-[10px] font-mono text-white/40 tracking-tighter">Verified Supplier</span>
                </div>
              </div>

              {/* Business Info */}
              <div className="space-y-4 mb-10">
                <h4 className="text-3xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">
                  {name || 'Your Business Name'}
                </h4>
                <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1.5"><Globe size={12} /> Global Registry</span>
                  <span className="w-1 h-1 bg-white/10 rounded-full" />
                  <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> IPFS Secure</span>
                </div>
              </div>

              {/* Bio Section */}
              <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 relative group-hover:border-blue-500/10 transition-all min-h-[120px]">
                <div className="text-[10px] font-black text-blue-400/50 uppercase tracking-widest mb-4 italic">About Us</div>
                <p className="text-sm text-white/60 font-medium leading-relaxed italic">
                  {bio || "Update your biography on the left to show potential managers what makes your services stand out."}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between opacity-30">
                 <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Identity Secure</div>
                 <ShieldCheck size={16} />
              </div>

              {/* Decorative Glow */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupplierProfile;
