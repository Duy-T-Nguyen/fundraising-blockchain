import React, { useState } from 'react';
import { useRequests } from '../../hooks/useRequests';
import { ABIS } from '../../blockchain/constants';
import {
  CheckCircle2,
  Wallet,
  Users,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  LayoutDashboard,
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { encodeFunctionData, formatEther } from 'viem';
import { publicClient, getWalletClient } from '../../blockchain/client';
import { useRelayer } from '../../hooks/useRelayer';

interface RequestsListProps {
  address: string;
  isManager: boolean;
  hasDonated: boolean;
  userDonorId: bigint;
  donorsCount: string | number;
}

const RequestsList: React.FC<RequestsListProps> = ({ address, isManager, hasDonated, userDonorId, donorsCount }) => {
  const { address: userAddress } = useWallet();
  const { requests, votedRequestIds, pendingRequestIds, isLoading, refresh } = useRequests(address, userAddress || undefined);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { executeGasless, isRelaying } = useRelayer();

  // --- AI Approve (Gasless, queued) ---
  const handleApprove = async (index: number) => {
    if (!userAddress) return;
    setProcessingId(index);
    try {
      const data = encodeFunctionData({
        abi: ABIS.CAMPAIGN,
        functionName: 'approveRequest',
        args: [BigInt(index)],
      });
      await executeGasless(address, data);
      refresh();
    } catch (err) {
      console.error('AI Approval failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // --- Direct Approve (Self-paid gas) ---
  const handleApproveDirect = async (index: number) => {
    if (!userAddress) return;
    setProcessingId(index);
    try {
      const walletClient = getWalletClient();
      if (!walletClient) throw new Error('Wallet not found');

      const { request } = await publicClient.simulateContract({
        account: userAddress as `0x${string}`,
        address: address as `0x${string}`,
        abi: ABIS.CAMPAIGN,
        functionName: 'approveRequest',
        args: [BigInt(index)],
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      refresh();
    } catch (err) {
      console.error('Direct Approval failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // --- Finalize & Pay (Manager only, AI gasless) ---
  const handleFinalize = async (index: number) => {
    if (!userAddress) return;
    setProcessingId(index);
    try {
      const data = encodeFunctionData({
        abi: ABIS.CAMPAIGN,
        functionName: 'finalizeRequest',
        args: [BigInt(index)],
      });
      await executeGasless(address, data);
      refresh();
    } catch (err) {
      console.error('Finalization failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-xl border border-white/50 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Requests...</p>
      </div>
    );
  }

  // --- Empty State ---
  if (requests.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-xl border border-white/50 text-center space-y-4">
        <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Spending Requests</h2>
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem]">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <LayoutDashboard size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-bold">No active requests found</p>
          <p className="text-sm text-gray-400">The manager hasn't created any spending requests yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <ShieldCheck size={28} className="text-blue-600" />
          Spending Requests
        </h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1 ml-10">
          Community Governance in Action
        </p>
      </div>

      {/* Request Cards */}
      <div className="space-y-6">
        {requests.map((req, idx) => {
          const currentAmount = parseFloat(formatEther(BigInt(req.approvalWeights)));
          const targetAmount = parseFloat(formatEther(req.snapshotTotalFunds)) / 2;
          const isComplete = req.complete;
          const canFinalize = currentAmount > targetAmount;
          const isEligible = userDonorId > BigInt(0) && userDonorId <= req.snapshotDonorCount;
          const isVoted = votedRequestIds.has(req.id);
          const isPending = pendingRequestIds.has(req.id);

          return (
            <div
              key={idx}
              className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl transition-shadow group relative overflow-hidden"
            >
              {/* Decorative badge */}
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-slate-50 rounded-full flex items-end justify-start p-8 opacity-50 group-hover:scale-110 transition-transform">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{req.id}</span>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                {/* Left: Info */}
                <div className="space-y-6 flex-1 w-full">
                  {/* Status badge */}
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isComplete ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600'}`}>
                      {isComplete ? 'Completed' : 'Under Review'}
                    </span>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID: #{req.id}</span>
                  </div>

                  {/* Description & meta */}
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{req.description}</h3>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2 text-blue-600 font-bold">
                        <Wallet size={16} />
                        <span>{req.value} ETH</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <Users size={16} className="text-blue-500" />
                        <span className="flex items-center gap-1.5">
                          {req.voterCount} {req.voterCount === 1 ? 'Approval' : 'Approvals'}
                          <span className="text-[10px] font-normal text-gray-400">({formatEther(BigInt(req.approvalWeights))} ETH)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg">
                        <ArrowUpRight size={14} />
                        <span className="font-mono text-xs truncate max-w-[120px]">{req.recipient}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Area */}
                  <div className="flex items-center gap-4">

                    {/* === DONOR SECTION === */}
                    {!isManager && !isComplete && (
                      <div className="flex flex-col gap-3 w-full min-w-[160px]">
                        {/* Already voted on-chain */}
                        {isVoted && (
                          <div className="w-full flex items-center justify-center gap-2 text-blue-600 bg-blue-50 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-blue-100">
                            <CheckCircle2 size={16} />
                            Approved
                          </div>
                        )}

                        {/* Pending in AI queue */}
                        {!isVoted && isPending && (
                          <div className="w-full h-[116px] px-4 bg-indigo-50 border border-indigo-100 text-indigo-500 rounded-xl font-black uppercase tracking-widest text-[10px] text-center flex flex-col items-center justify-center gap-2 shadow-inner">
                            <div className="flex items-center gap-2">
                              <span className="animate-spin text-lg">🌀</span>
                              <span>Pending AI Execution</span>
                            </div>
                            <span className="text-[8px] normal-case tracking-normal font-medium text-indigo-400">
                              Your intent is queued for optimal gas
                            </span>
                          </div>
                        )}

                        {/* Not eligible */}
                        {!isVoted && !isPending && !isEligible && (
                          <div className="w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl font-bold uppercase tracking-widest text-[10px] text-center flex flex-col items-center justify-center gap-1">
                            <span className="text-gray-500">Not Eligible</span>
                            {!hasDonated ? (
                              <span className="text-[8px] normal-case tracking-normal">Must donate to vote</span>
                            ) : (
                              <span className="text-[8px] normal-case tracking-normal">Donated after request</span>
                            )}
                          </div>
                        )}

                        {/* Eligible — show both approve buttons */}
                        {!isVoted && !isPending && isEligible && (
                          <>
                            <button
                              onClick={() => handleApproveDirect(req.id)}
                              disabled={processingId !== null || isRelaying}
                              className={`w-full h-[52px] px-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-md flex flex-col items-center justify-center ${
                                processingId === req.id && !isRelaying
                                  ? 'opacity-80 scale-[0.98]'
                                  : processingId !== null || isRelaying
                                  ? 'cursor-not-allowed'
                                  : 'hover:bg-gray-800 hover:-translate-y-0.5'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {processingId === req.id && !isRelaying ? (
                                  <><span className="animate-spin">🌀</span> Processing...</>
                                ) : (
                                  <><Zap size={14} className="text-amber-400" /> Direct Approve</>
                                )}
                              </div>
                              {!(processingId === req.id && !isRelaying) && (
                                <span className="text-[8px] text-gray-400 normal-case tracking-normal font-medium mt-0.5">Self-paid Gas (Fast)</span>
                              )}
                            </button>

                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={processingId !== null || isRelaying}
                              className={`w-full h-[52px] px-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-md shadow-blue-600/20 flex flex-col items-center justify-center ${
                                processingId === req.id && isRelaying
                                  ? 'opacity-80 scale-[0.98]'
                                  : processingId !== null || isRelaying
                                  ? 'cursor-not-allowed'
                                  : 'hover:bg-blue-700 hover:-translate-y-0.5'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {processingId === req.id && isRelaying ? (
                                  <><span className="animate-spin">🌀</span> AI Optimizing...</>
                                ) : (
                                  <><ShieldCheck size={14} className="text-emerald-300" /> AI Approve</>
                                )}
                              </div>
                              {!(processingId === req.id && isRelaying) && (
                                <span className="text-[8px] text-blue-200 normal-case tracking-normal font-medium mt-0.5">Free Gas (Delayed)</span>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* === MANAGER SECTION === */}
                    {isManager && !isComplete && (
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => handleFinalize(req.id)}
                          disabled={!canFinalize || processingId === req.id || isRelaying}
                          className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg flex items-center gap-2 ${
                            canFinalize
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {processingId === req.id ? (
                            <><span className="animate-spin">🌀</span> {isRelaying ? 'AI Finalizing...' : 'Loading...'}</>
                          ) : (
                            'Finalize & Pay'
                          )}
                        </button>
                        {canFinalize && !isRelaying && (
                          <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                            <Zap size={8} /> Gasless AI Optimized
                          </span>
                        )}
                        {!canFinalize && (
                          <div className="flex items-center gap-1 text-[9px] text-amber-500 font-bold uppercase tracking-wider">
                            <AlertCircle size={10} />
                            Needs {Math.floor(Number(donorsCount) / 2 + 1)} votes
                          </div>
                        )}
                      </div>
                    )}

                    {/* === COMPLETED SECTION === */}
                    {isComplete && (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">
                        <CheckCircle2 size={16} />
                        Funds Released
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RequestsList;
