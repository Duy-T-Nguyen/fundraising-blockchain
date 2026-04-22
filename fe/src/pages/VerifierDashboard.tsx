import { useState } from 'react';
import { Shield, LayoutGrid, CheckCircle, Clock } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useVerifierTasks } from '../hooks/useVerifierTasks';
import { VerifierStats } from '../components/verifier/VerifierStats';
import { ExpertTaskCard } from '../components/verifier/ExpertTaskCard';
import { CommunityTaskCard } from '../components/verifier/CommunityTaskCard';
import { SignatureModal } from '../components/verifier/SignatureModal';
import type { VerifierTask } from '../types/verifier';
import { publicClient, getWalletClient } from '../blockchain/client';
import { ABIS } from '../blockchain/constants';

const VerifierDashboard = () => {
  const { address } = useWallet();
  const { tasks, isLoading, stats, refresh } = useVerifierTasks(address as `0x${string}` | undefined);
  const [activeTab, setActiveTab] = useState<'expert' | 'community'>('expert');
  const [selectedTask, setSelectedTask] = useState<VerifierTask | null>(null);
  const [lastSignature, setLastSignature] = useState<{ id: string, sig: string } | null>(null);

  const filteredTasks = tasks.filter(t => 
    activeTab === 'expert' ? t.type === 'EXPERT_SIGNATURE' : t.type === 'COMMUNITY_VOTE'
  );

  const handleSignSuccess = (signature: string) => {
    if (selectedTask) {
      setLastSignature({ id: selectedTask.id, sig: signature });
      setSelectedTask(null);
      // In a real app, we would POST this to a backend for the Manager to retrieve
      console.log(`Success! Signature for task ${selectedTask.id}: ${signature}`);
    }
  };

  const handleCommunityApprove = async (task: VerifierTask) => {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient || !address) return;

      const { request } = await publicClient.simulateContract({
        address: task.campaignAddress,
        abi: ABIS.CAMPAIGN,
        functionName: 'approveAsValidator',
        args: [BigInt(task.requestIndex)],
        account: address as `0x${string}`
      });

      await walletClient.writeContract(request);
      refresh();
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Approval failed. See console for details.');
    }
  };

  const openIPFS = (hash: string) => {
    window.open(`https://ipfs.io/ipfs/${hash}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="pt-12 pb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900">Verifier Hub</h1>
              <p className="text-slate-500 font-medium tracking-wide">Secure certification & community validation center.</p>
            </div>
          </div>
        </div>

        {!address ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm mt-32">
            <Shield size={64} className="mx-auto text-slate-200 mb-6" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Wallet Disconnected</h2>
            <p className="text-slate-400">Please connect your wallet to access your verification duties.</p>
          </div>
        ) : (
          <>
            <VerifierStats stats={stats} />

            <div className="flex items-center justify-between mb-8">
              <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                <button
                  onClick={() => setActiveTab('expert')}
                  className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'expert' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Expert Tasks ({stats.pendingExpert})
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'community' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Community Voting ({stats.pendingCommunity})
                </button>
              </div>
              
              <button 
                onClick={() => refresh()}
                className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all hover:shadow-md"
                title="Refresh tasks"
              >
                <LayoutGrid size={20} />
              </button>
            </div>

            {isLoading ? (
              <div className="py-40 flex flex-col items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-slate-100 border-t-indigo-600 rounded-full mb-6" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Blockchain for Verification duties...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-[3rem] py-32 text-center border border-slate-100 border-dashed">
                <Clock size={48} className="mx-auto text-slate-100 mb-6" />
                <h3 className="text-xl font-black text-slate-900 mb-2">No pending items</h3>
                <p className="text-slate-400 max-w-xs mx-auto text-sm">You have cleared all your current {activeTab} tasks. Good job!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {lastSignature && (
                  <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl animate-in slide-in-from-top-4 mb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CheckCircle size={24} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-75">Certificate Generated</p>
                          <p className="text-xs font-mono break-all line-clamp-1">{lastSignature.sig}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(lastSignature.sig);
                          alert('Signature copied to clipboard!');
                        }}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black uppercase transition-all"
                      >
                        Copy Signature
                      </button>
                    </div>
                  </div>
                )}

                {filteredTasks.map(task => (
                  activeTab === 'expert' ? (
                    <ExpertTaskCard 
                      key={task.id} 
                      task={task} 
                      onSign={setSelectedTask} 
                      onOpenIPFS={openIPFS} 
                    />
                  ) : (
                    <CommunityTaskCard 
                      key={task.id} 
                      task={task} 
                      onApprove={handleCommunityApprove} 
                    />
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <SignatureModal 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSuccess={handleSignSuccess}
      />
    </div>
  );
};

export default VerifierDashboard;
