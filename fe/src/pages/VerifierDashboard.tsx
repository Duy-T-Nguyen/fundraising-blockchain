import { useState } from 'react';
import { Shield, LayoutGrid, CheckCircle, Lock } from 'lucide-react';

import { useWallet } from '../hooks/useWallet';
import { useVerifierTasks } from '../hooks/useVerifierTasks';
import { VerifierStats } from '../components/verifier/VerifierStats';
import { ExpertTaskCard } from '../components/verifier/ExpertTaskCard';
import { CommunityTaskCard } from '../components/verifier/CommunityTaskCard';
import { SignatureModal } from '../components/verifier/SignatureModal';
import type { VerifierTask } from '../types/verifier';
import { publicClient, getWalletClient } from '../blockchain/client';
import { ABIS } from '../blockchain/constants';
import { useNotification } from '../context/NotificationContext';

const VerifierDashboard = () => {
  const { address } = useWallet();
  const { tasks, isLoading, stats, refresh } = useVerifierTasks(address as `0x${string}` | undefined);
  const toast = useNotification();
  const [selectedTask, setSelectedTask] = useState<VerifierTask | null>(null);

  const filteredTasks = tasks.filter(t => t.type === 'EXPERT_SIGNATURE');

  const handleSignSuccess = (signature: string) => {
    if (selectedTask) {
      setSelectedTask(null);
      toast.success('Certificate generated! Signature ready.');
      navigator.clipboard.writeText(signature).catch(() => { });
      console.log(`Signature for task ${selectedTask.id}: ${signature}`);
    }
  };

  const handleExpertVerify = async (task: VerifierTask) => {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient || !address) return;

      toast.info('Initiating on-chain verification...');

      const { request } = await publicClient.simulateContract({
        address: task.campaignAddress,
        abi: ABIS.CAMPAIGN,
        functionName: 'verifyRequest',
        args: [BigInt(task.requestIndex)],
        account: address as `0x${string}`
      });

      const hash = await walletClient.writeContract(request);
      toast.success('Verification submitted! Waiting for confirmation...');
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success('Evidence officially verified!');
      refresh();
    } catch (error: any) {
      console.error('Verification failed:', error);
      toast.error(error?.shortMessage || error?.message || 'Verification failed.');
    }
  };

  const handleExpertReject = async (task: VerifierTask) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const walletClient = await getWalletClient();
      if (!walletClient || !address) return;

      const { request } = await publicClient.simulateContract({
        address: task.campaignAddress,
        abi: ABIS.CAMPAIGN,
        functionName: 'rejectRequest',
        args: [BigInt(task.requestIndex), reason],
        account: address as `0x${string}`
      });

      const hash = await walletClient.writeContract(request);
      toast.success('Rejection submitted!');
      await publicClient.waitForTransactionReceipt({ hash });
      refresh();
    } catch (error: any) {
      console.error('Rejection failed:', error);
      toast.error(error?.shortMessage || error?.message || 'Rejection failed.');
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

      const hash = await walletClient.writeContract(request);
      toast.success('Vote submitted! Waiting for confirmation...');
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success('Community approval confirmed!');
      refresh();
    } catch (error: any) {
      console.error('Approval failed:', error);
      toast.error(error?.shortMessage || error?.message || 'Approval failed.');
    }
  };

  const openIPFS = (hash: string) => {
    window.open(`https://ipfs.io/ipfs/${hash}`, '_blank');
  };

  return (
    <div
      className="min-h-screen pb-20 pt-24"
      style={{ background: 'linear-gradient(180deg, #0b1628 0%, #112044 20%, #1e3464 50%, #0b1628 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="pb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] flex items-center justify-center text-indigo-400 shadow-2xl backdrop-blur-xl">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">Verifier Hub</h1>
              <p className="text-white/40 font-black tracking-[0.2em] uppercase text-[10px] mt-2">Secure certification & community validation center.</p>
            </div>
          </div>
        </div>

        {!address ? (
          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] p-24 text-center border border-white/10 shadow-2xl mt-20 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
              <Shield size={40} className="text-white/10" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Wallet Disconnected</h2>
            <p className="text-white/30 text-sm font-medium">Please connect your authorized identity to access verification duties.</p>
          </div>
        ) : (
          <>
            <VerifierStats stats={stats} />

            <div className="flex items-center justify-between mb-8 gap-4">
              <div className="flex bg-white/5 px-8 py-4 rounded-[1.8rem] border border-white/10 backdrop-blur-xl shadow-xl">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                   Active Expert Tasks ({stats.pendingExpert})
                 </span>
              </div>

              <button
                onClick={() => refresh()}
                className="p-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-white/20 hover:text-indigo-400 transition-all hover:bg-white/10 hover:shadow-2xl active:scale-95"
                title="Refresh tasks"
              >
                <LayoutGrid size={22} />
              </button>
            </div>

            {isLoading ? (
              <div className="py-40 flex flex-col items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-white/5 border-t-indigo-500 rounded-full mb-8 shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">Synchronizing with Decentralized Registry...</p>
              </div>
            ) : stats.totalTasks === 0 ? (
              // ❌ NOT A VERIFIER: Show Access Denied
              <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] py-32 text-center border-2 border-dashed border-white/5 mt-4">
                <div className="w-24 h-24 bg-red-500/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/10">
                  <Lock size={40} className="text-red-500/20" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Personnel Access Restricted</h3>
                <p className="text-white/40 max-w-sm mx-auto text-[13px] font-medium leading-relaxed">
                  Wallet <span className="font-mono text-[11px] bg-white/5 text-indigo-400 px-3 py-1 rounded-lg border border-white/10">{address?.slice(0, 6)}...{address?.slice(-4)}</span> has not been assigned protocol validation permissions for any current cycles.
                </p>
                <p className="text-indigo-400/40 text-[9px] mt-8 uppercase tracking-[0.3em] font-black">Authorized Personnel Only</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              // Tab is empty
              <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] py-32 text-center border border-white/5 border-dashed">
                <div className="w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/10">
                  <CheckCircle size={48} className="text-emerald-500/20" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Queue Synchronized</h3>
                <p className="text-white/30 max-w-xs mx-auto text-sm font-medium italic">All pending expert assignments completed.</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredTasks.map(task => (
                  <ExpertTaskCard
                    key={task.id}
                    task={task}
                    onVerify={handleExpertVerify}
                    onReject={handleExpertReject}
                    onOpenIPFS={openIPFS}
                  />
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
