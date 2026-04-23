import { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, Wallet,
  XCircle, Loader2,
  Activity, BarChart3, Droplets, Plus, Settings
} from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { useNotification } from '../context/NotificationContext';
import { getWalletClient, publicClient } from '../blockchain/client';

// Modular Components
import OverviewTab from '../components/admin/tabs/OverviewTab';
import RequestsTab from '../components/admin/tabs/RequestsTab';
import SuppliersTab from '../components/admin/tabs/SuppliersTab';
import OversightTab from '../components/admin/tabs/OversightTab';
import SettingsTab from '../components/admin/tabs/SettingsTab';

type TabType = 'overview' | 'requests' | 'suppliers' | 'oversight' | 'settings';

const AdminDashboard = () => {
  const {
    address, isAdmin, requests, suppliers, stats, loading, refresh,
    approveRequest, rejectRequest, addSupplier, removeSupplier,
    updateSpamFee, withdrawFactoryFees, withdrawCampaignGas
  } = useAdmin();

  const toast = useNotification();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Supplier form state
  const [newSupplierAddr, setNewSupplierAddr] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierBio, setNewSupplierBio] = useState('');
  const [newSupplierFile, setNewSupplierFile] = useState<File | null>(null);

  // Settings state
  const [newFee, setNewFee] = useState('');

  useEffect(() => {
    if (stats) setNewFee(stats.antiSpamFee);
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck size={24} className="text-blue-600" />
          </div>
        </div>
        <p className="text-slate-500 font-bold tracking-tight animate-pulse uppercase text-[10px]">Establishing Secure Admin Tunnel...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-[40px] p-12 text-center shadow-2xl">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle size={48} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Access Denied</h2>
          <p className="text-slate-500 leading-relaxed mb-8 font-medium">
            This sector is restricted to the platform administrator. Connect the master wallet to proceed.
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-mono text-slate-400 break-all mb-8 uppercase tracking-wider">
            {(window.ethereum as any)?.selectedAddress || 'No Wallet Detected'}
          </div>
          <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-3xl transition-all shadow-xl active:scale-95">
            Return to Safety
          </button>
        </div>
      </div>
    );
  }

  const handleAction = async (action: () => Promise<any>, id: string) => {
    try {
      setProcessingId(id);
      const hash = await action();

      // If it's a transaction hash, wait for it to be mined
      if (hash && typeof hash === 'string' && hash.startsWith('0x')) {
        await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
      }

      await refresh();
      toast.success('Action completed successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Transaction failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24 font-sans">
      {/* ── HEADER ── */}
      <header className="px-10 pt-24 pb-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Command Center</h1>
          </div>

          <div className="flex items-center gap-5">
            <button onClick={refresh} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all group active:scale-95">
              <Activity size={22} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
            </button>

            <div className="px-8 py-5 bg-white border border-slate-200 rounded-[32px] flex items-center gap-6 shadow-xl shadow-slate-200/40">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Global Treasury</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats?.factoryBalance} <span className="text-blue-600">ETH</span></p>
              </div>
              <button
                onClick={() => handleAction(withdrawFactoryFees, 'withdraw-fees')}
                disabled={processingId === 'withdraw-fees' || stats?.factoryBalance === '0'}
                className="p-4 bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl transition-all shadow-lg active:scale-90"
              >
                {processingId === 'withdraw-fees' ? <Loader2 size={24} className="animate-spin" /> : <Wallet size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-10 py-12">
        {/* ── HORIZONTAL TABS ── */}
        <div className="flex flex-wrap gap-2 p-2 bg-white border border-slate-200 rounded-[28px] mb-12 w-fit shadow-sm">
          {[
            { id: 'overview', icon: <BarChart3 size={18} />, label: 'Overview' },
            { id: 'requests', icon: <Plus size={18} />, label: 'Campaign Requests' },
            { id: 'suppliers', icon: <Users size={18} />, label: 'Suppliers' },
            { id: 'oversight', icon: <Droplets size={18} />, label: 'Gas Status' },
            { id: 'settings', icon: <Settings size={18} />, label: 'System Config' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                px-8 py-4 rounded-[22px] flex items-center gap-3 text-sm font-black transition-all duration-300 tracking-tight
                ${activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="transition-all duration-500 transform">

          {activeTab === 'overview' && stats && <OverviewTab stats={stats} />}

          {activeTab === 'requests' && (
            <RequestsTab
              requests={requests}
              processingId={processingId}
              onApprove={(id) => handleAction(() => approveRequest(id), `approve-${id}`)}
              onReject={(id) => handleAction(() => rejectRequest(id), `reject-${id}`)}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersTab
              suppliers={suppliers}
              processingId={processingId}
              newSupplierAddr={newSupplierAddr}
              setNewSupplierAddr={setNewSupplierAddr}
              newSupplierName={newSupplierName}
              setNewSupplierName={setNewSupplierName}
              newSupplierBio={newSupplierBio}
              setNewSupplierBio={setNewSupplierBio}
              newSupplierFile={newSupplierFile}
              setNewSupplierFile={setNewSupplierFile}
              onAdd={() => handleAction(async () => {
                if (!newSupplierFile || !address) return;

                const walletClient = await getWalletClient();
                const signature = await walletClient.signMessage({
                  account: address as `0x${string}`,
                  message: 'FundChain IPFS Upload',
                });

                // 1. Upload Evidence Image
                const formData = new FormData();
                formData.append('file', newSupplierFile);
                formData.append('address', address);
                formData.append('signature', signature);

                const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evidence/upload`, {
                  method: 'POST',
                  body: formData,
                });
                const { cid: imgCid } = await uploadRes.json();

                // 2. Upload Metadata JSON
                const metadata = {
                  name: newSupplierName,
                  description: newSupplierBio,
                  image: `ipfs://${imgCid}`,
                  type: 'SUPPLIER_VERIFICATION'
                };

                const metaRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evidence/metadata`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ metadata, address, signature }),
                });
                const { cid: metaCid } = await metaRes.json();

                // 3. Smart Contract Call
                const hash = await addSupplier(newSupplierAddr, newSupplierName, metaCid);

                // Reset form
                setNewSupplierAddr('');
                setNewSupplierName('');
                setNewSupplierBio('');
                setNewSupplierFile(null);

                return hash;
              }, 'add-supplier')}
              onRemove={(addr) => handleAction(() => removeSupplier(addr), `remove-${addr}`)}
            />
          )}

          {activeTab === 'oversight' && (
            <OversightTab
              approvedRequests={requests.filter(r => r.status === 'APPROVED')}
              processingId={processingId}
              onWithdrawGas={(addr) => handleAction(() => withdrawCampaignGas(addr), `gas-${addr}`)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              newFee={newFee}
              setNewFee={setNewFee}
              processingId={processingId}
              onUpdateFee={() => handleAction(() => updateSpamFee(newFee), 'update-fee')}
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
