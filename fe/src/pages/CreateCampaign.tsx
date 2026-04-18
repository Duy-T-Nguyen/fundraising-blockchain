import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ImagePlus, Loader2, CheckCircle,
  AlertCircle, ChevronDown, ArrowLeft, Zap,
  ShieldCheck, Eye, Users, Wallet, ArrowRight,
} from 'lucide-react';
import { parseEther } from 'viem';
import { getWalletClient } from '../blockchain/client';
import { ABIS, CONTRACT_ADDRESSES } from '../blockchain/constants';
import { useWallet } from '../hooks/useWallet';

const CATEGORIES = [
  { label: 'Education', value: 0 },
  { label: 'Health & Medical', value: 1 },
  { label: 'Disaster Relief', value: 2 },
  { label: 'Environment', value: 3 },
  { label: 'Others', value: 4 },
];

const STEPS = [
  { icon: <Wallet size={18} />, title: 'Connect Wallet', desc: 'Use MetaMask to authenticate as the campaign manager.' },
  { icon: <ImagePlus size={18} />, title: 'Submit Request', desc: 'Fill in details and pay a 0.005 ETH anti-spam fee to start.' },
  { icon: <ShieldCheck size={18} />, title: 'Admin Review', desc: 'Platform admins will review your campaign for legitimacy.' },
  { icon: <Zap size={18} />, title: 'Go Live', desc: 'Once approved, your campaign contract is deployed automatically.' },
];

const ANTI_SPAM_FEE = parseEther('0.005');

const TRUST = [
  { icon: <ShieldCheck size={15} />, label: 'Audited Smart Contracts' },
  { icon: <Eye size={15} />, label: 'All funds publicly traceable' },
  { icon: <Users size={15} />, label: 'Donor-voted disbursements' },
];

type TxStatus = 'idle' | 'submitting' | 'success' | 'error';


const CreateCampaign = () => {
  const navigate = useNavigate();
  const { isConnected, connect, address } = useWallet();

  // Form state
  const [image, setImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(0);

  // Tx state
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txError, setTxError] = useState('');
  const [txHash, setTxHash] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image Upload ──────────────────────────────────────────
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageName(file.name);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) { connect(); return; }
    if (!title.trim() || !description.trim() || !selectedFile) return;

    setTxStatus('submitting');
    setTxError('');

    try {
      const walletClient = getWalletClient();
      if (!walletClient || !address) throw new Error('Wallet not connected');

      // 1. Sign message for Backend verification
      const message = 'FundChain IPFS Upload';
      const signature = await walletClient.signMessage({
        account: address as `0x${string}`,
        message,
      });

      // 2. Upload to Backend (IPFS)
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('address', address);
      formData.append('signature', signature);

      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evidence/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.message || 'Failed to upload image to IPFS');
      }

      const { cid } = await uploadRes.json();
      const ipfsHash = `ipfs://${cid}`;

      // 3. Submit to Blockchain
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        abi: ABIS.CAMPAIGN_FACTORY as any,
        functionName: 'submitCampaignRequest',
        args: [
          title.trim(),
          description.trim(),
          ipfsHash, 
          category,
          parseEther('0.001') // Minimum contribution
        ],
        account: address as `0x${string}`,
        value: ANTI_SPAM_FEE,
      } as any);

      setTxHash(hash);
      setTxStatus('success');
    } catch (err: unknown) {
      console.error('Submit error:', err);
      const msg = err instanceof Error ? err.message : 'Transaction failed.';
      setTxError(msg.length > 120 ? msg.slice(0, 120) + '…' : msg);
      setTxStatus('error');
    }
  };

  const isSubmitting = txStatus === 'submitting';

  // ── Success screen ────────────────────────────────────────
  if (txStatus === 'success') {
    return (
      <main style={{ background: 'linear-gradient(180deg, #0b1628 0%, #112044 10%, #1e3464 22%, #4a6fa5 35%, #8aaed4 46%, #c4d6f0 56%, #dde8f8 65%, #eef3fc 75%, #f6f9fe 88%, #ffffff 100%)', minHeight: '100vh' }}>
        <div className="max-w-lg mx-auto px-6 py-32 flex flex-col items-center text-center gap-8">
          <h2 className="text-5xl font-black text-white tracking-tight">Request Submitted!</h2>
          <p className="text-white text-[18px] leading-relaxed opacity-90 font-medium">
            Your campaign request has been sent for approval. <br /> A 0.005 ETH anti-spam fee was processed and verified.
          </p>
          
          {txHash && (
            <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 border border-white/30 text-white rounded-2xl text-[15px] font-bold hover:bg-white/30 transition-all no-underline backdrop-blur-md">
              View on Etherscan ↗
            </a>
          )}

          <div className="flex gap-4 mt-8">
            <button onClick={() => navigate('/campaigns')} 
              className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-2xl transition shadow-xl shadow-blue-500/20">
              Browse Campaigns
            </button>
            <button onClick={() => { setTxStatus('idle'); setTitle(''); setDescription(''); setImage(null); setSelectedFile(null); }}
              className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-black rounded-2xl border border-white/40 transition backdrop-blur-md">
              Submit Another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        background: 'linear-gradient(180deg, #0b1628 0%, #112044 10%, #1e3464 22%, #4a6fa5 35%, #8aaed4 46%, #c4d6f0 56%, #dde8f8 65%, #eef3fc 75%, #f6f9fe 88%, #ffffff 100%)',
        minHeight: '100vh',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Back button */}
        <button onClick={() => navigate('/campaigns')}
          className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-10 transition font-semibold text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Campaigns
        </button>

        {/* ── 2-Column Layout ── */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ═══ LEFT PANEL ═══ */}
          <div className="lg:w-[420px] shrink-0 sticky top-24">

            {/* Title block */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-black uppercase tracking-widest rounded-full">
                <Zap size={11} /> Submit to Sepolia
              </span>
              <h1 className="text-4xl font-black text-white tracking-tight mb-3 leading-tight">
                Start Your<br />
                <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  Impact Campaign
                </span>
              </h1>
              <p className="text-blue-200/60 text-[15px] leading-relaxed">
                Every campaign is a transparent smart contract on the blockchain. Donors can verify exactly where their money goes.
              </p>
            </div>

            {/* How it works steps */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-3xl p-6 mb-6 backdrop-blur-md shadow-xl">
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-5">How it works</p>
              <div className="space-y-5">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-300">
                      {step.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-wider">Step {i + 1}</span>
                      </div>
                      <p className="text-white font-bold text-sm">{step.title}</p>
                      <p className="text-slate-300/80 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust signals */}
            <div className="space-y-2.5">
              {TRUST.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-2xl backdrop-blur-md">
                  <span className="text-green-400">{item.icon}</span>
                  <span className="text-slate-200 text-sm font-semibold">{item.label}</span>
                  <ArrowRight size={13} className="ml-auto text-slate-500" />
                </div>
              ))}
            </div>
          </div>

          {/* ═══ RIGHT: FORM CARD ═══ */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit}>
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">

                {/* ── Image Upload ── */}
                <div className="p-8 border-b border-gray-100">
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                    Campaign Cover Image
                  </label>

                  {/* Upload zone — shows preview inline when image selected */}
                  <div
                    className={`relative border-2 border-dashed rounded-2xl overflow-hidden h-56 flex flex-col items-center justify-center gap-3 transition-all duration-200
                      ${image ? 'border-blue-400 cursor-default' : isDragging ? 'border-blue-500 bg-blue-50/60 cursor-pointer' : 'border-white/60 hover:border-blue-400 hover:bg-white/40 cursor-pointer'}`}
                    onClick={() => !image && fileInputRef.current?.click()}
                    onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                  >
                    {image ? (
                      /* ── Preview state ── */
                      <>
                        <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        {/* Dark overlay with file name */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                          <span className="text-white text-xs font-mono bg-black/40 px-2 py-1 rounded-lg truncate max-w-[70%]">
                            {imageName}
                          </span>
                          <span className="text-green-300 text-[10px] font-black uppercase tracking-wider bg-green-900/40 px-2 py-1 rounded-lg">
                            ✓ Selected
                          </span>
                        </div>
                      </>
                    ) : (
                      /* ── Empty state ── */
                      <>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-100' : 'bg-white/40 backdrop-blur-sm'}`}>
                          <ImagePlus size={26} className={isDragging ? 'text-blue-500' : 'text-gray-500'} />
                        </div>
                        <div className="text-center pointer-events-none">
                          <p className="font-bold text-gray-700 text-sm">
                            {isDragging ? 'Drop your image here' : 'Drag & drop or click to upload'}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action buttons — shown only when image is selected */}
                  {image && (
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/60 hover:bg-white/80 border border-white/60 text-gray-700 font-bold rounded-xl text-sm backdrop-blur-sm transition-colors">
                        <ImagePlus size={15} /> Choose Different Image
                      </button>
                      <button type="button" onClick={() => { setImage(null); setImageName(''); }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-xl text-sm transition-colors">
                        <X size={15} /> Remove
                      </button>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                </div>

                {/* ── Fields ── */}
                <div className="p-8 space-y-7">

                  {/* Campaign Name */}
                  <div>
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-2">
                      Campaign Name <span className="text-red-400">*</span>
                    </label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Clean Water for Rural Communities" maxLength={80}
                      className="w-full px-4 py-3.5 rounded-xl border border-white/60 text-gray-900 font-medium text-[15px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition bg-white/60 backdrop-blur-sm placeholder-gray-400" />
                    <p className="text-xs text-gray-400 mt-1.5 text-right">{title.length}/80</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-2">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your campaign goals, how funds will be used, and who will benefit..."
                      rows={5} maxLength={1000}
                      className="w-full px-4 py-3.5 rounded-xl border border-white/60 text-gray-900 font-medium text-[15px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition bg-white/60 backdrop-blur-sm placeholder-gray-400 resize-none" />
                    <p className="text-xs text-gray-400 mt-1.5 text-right">{description.length}/1000</p>
                  </div>

                  {/* Category — full width */}
                  <div>
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-2">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select value={category} onChange={(e) => setCategory(Number(e.target.value))}
                        className="w-full appearance-none px-4 pr-10 py-3.5 rounded-xl border border-white/60 text-gray-900 font-medium text-[15px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition bg-white/60 backdrop-blur-sm cursor-pointer">
                        {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* On-chain notice */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <Zap size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-blue-700 text-sm leading-relaxed">
                      Submitting will call <code className="bg-blue-100 px-1 rounded text-[12px]">submitCampaignRequest()</code>. A fee of <span className="font-bold">0.005 ETH</span> is required.
                    </p>
                  </div>

                  {/* Error */}
                  {txStatus === 'error' && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                      <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-red-700 text-sm font-medium">{txError || 'Transaction failed. Please try again.'}</p>
                    </div>
                  )}

                  {/* Submit */}
                  {!isConnected ? (
                    <button type="button" onClick={connect}
                      className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-2xl shadow-lg shadow-amber-500/20 transition-all duration-200 hover:-translate-y-0.5 text-[16px]">
                      Connect Wallet to Continue
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting || !title.trim() || !description.trim()}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 disabled:shadow-none transition-all duration-200 hover:enabled:-translate-y-0.5 text-[16px] flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <><Loader2 size={20} className="animate-spin" /> Submitting Request...</>
                      ) : (
                        'Submit Campaign Request (0.005 ETH) →'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateCampaign;

