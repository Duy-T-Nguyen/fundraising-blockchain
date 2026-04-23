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
  ExternalLink,
  Image as ImageIcon,
  Clock,
  XCircle,
  Eye,
  Camera,
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { encodeFunctionData, formatEther } from 'viem';
import { publicClient, getWalletClient } from '../../blockchain/client';
import { useRelayer } from '../../hooks/useRelayer';
import { useSupplierEvidence } from '../../hooks/useSupplierEvidence';

interface RequestsListProps {
  address: string;
  isManager: boolean;
  hasDonated: boolean;
  userDonorId: bigint;
  donorsCount: string | number;
}

const RequestsList: React.FC<RequestsListProps> = ({ address, isManager, hasDonated, userDonorId, donorsCount }) => {
  const { address: userAddress, isConnected, connect } = useWallet();
  const { requests, votedRequestIds, pendingRequestIds, pendingCreations, isLoading, refresh } = useRequests(address, userAddress || undefined);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { executeGasless, isRelaying } = useRelayer();
  const { 
    uploadingTaskId, 
    uploadedEvidences, 
    fileInputRef, 
    startUpload, 
    handleFileChange, 
    openIPFS 
  } = useSupplierEvidence(userAddress || undefined, isConnected, connect);

  // --- Verification Handlers ---
  const handleSubmitProof = async (requestId: number, proofCID: string) => {
    if (!userAddress) return;
    setProcessingId(requestId);
    try {
      const data = encodeFunctionData({
        abi: ABIS.CAMPAIGN,
        functionName: 'submitProof',
        args: [BigInt(requestId), proofCID],
      });
      await executeGasless(address, data);
      refresh();
    } catch (err) {
      console.error('Submit proof failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerify = async (requestId: number) => {
    if (!userAddress) return;
    setProcessingId(requestId);
    try {
      const data = encodeFunctionData({
        abi: ABIS.CAMPAIGN,
        functionName: 'verifyRequest',
        args: [BigInt(requestId)],
      });
      await executeGasless(address, data);
      refresh();
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!userAddress) return;
    const reason = prompt("Please enter the reason for rejection (will be stored on IPFS/Chain):");
    if (!reason) return;

    setProcessingId(requestId);
    try {
      // In a real app, we would upload the reason to IPFS first
      // For now, we'll use a placeholder or the raw text if short
      const data = encodeFunctionData({
        abi: ABIS.CAMPAIGN,
        functionName: 'rejectRequest',
        args: [BigInt(requestId), reason], 
      });
      await executeGasless(address, data);
      refresh();
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

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
  if (requests.length === 0 && pendingCreations.length === 0) {
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

      {/* Pending Creations Cards */}
      {pendingCreations.map((pending, pIdx) => (
        <div 
          key={`pending-cre-${pIdx}`}
          className="bg-gradient-to-br from-indigo-50 to-white rounded-[2.5rem] p-8 shadow-xl border border-indigo-100/50 animate-pulse"
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} fill="currentColor" />
                  AI Relayer Queue
                </span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  New Request Pending...
                </span>
              </div>
              <h3 className="text-2xl font-black text-indigo-900 opacity-60">Initializing Request...</h3>
              <p className="text-sm text-indigo-400 font-medium leading-relaxed max-w-2xl">
                Your spending request has been accepted by the AI Relayer. It is currently being batched for optimal gas efficiency and will appear on-chain shortly.
              </p>
            </div>
            <div className="bg-indigo-100/50 p-6 rounded-3xl border border-indigo-200/50 text-center min-w-[180px]">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">AI Optimizing Gas</p>
            </div>
          </div>
        </div>
      ))}

      {/* Request Cards */}
      <div className="space-y-6">
        {requests.map((req, idx) => {
          const currentAmount = parseFloat(formatEther(BigInt(req.approvalWeights)));
          const targetAmount = parseFloat(formatEther(req.snapshotTotalFunds)) / 2;
          const isComplete = req.complete;
          const isVerified = req.verifyStatus === 1; // APPROVED
          const isRejected = req.verifyStatus === 2; // REJECTED
          const canFinalize = currentAmount > targetAmount && isVerified;
          
          const isEligible = userDonorId > BigInt(0) && userDonorId <= req.snapshotDonorCount;
          const isVoted = votedRequestIds.has(req.id);
          const isPending = pendingRequestIds.has(req.id);

          const isSupplier = userAddress?.toLowerCase() === req.recipient.toLowerCase();
          const isVerifier = userAddress?.toLowerCase() === req.verifier.toLowerCase();
          
          const hasProof = req.proofCID && req.proofCID !== "";
          const taskKey = `${address}-${req.id}`;
          const localProof = uploadedEvidences[taskKey];

          return (
            <div
              key={idx}
              className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl transition-shadow group relative overflow-hidden"
            >
              {/* Status Banner */}
              <div className={`-mx-8 -mt-8 mb-6 px-8 py-4 flex items-center justify-between border-b transition-colors shadow-sm ${
                isComplete ? 'bg-emerald-50/50 border-emerald-100' :
                isRejected ? 'bg-rose-50/50 border-rose-100' :
                isVerified ? 'bg-blue-50/50 border-blue-100' :
                hasProof ? 'bg-amber-50/50 border-amber-100' :
                'bg-slate-50/50 border-slate-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-sm ${
                    isComplete ? 'bg-emerald-500 shadow-emerald-200' :
                    isRejected ? 'bg-rose-500 shadow-rose-200' :
                    isVerified ? 'bg-blue-500 shadow-blue-200' :
                    hasProof ? 'bg-amber-500 shadow-amber-200' :
                    'bg-slate-400'
                  }`} />
                  <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${
                    isComplete ? 'text-emerald-700' :
                    isRejected ? 'text-rose-700' :
                    isVerified ? 'text-blue-700' :
                    hasProof ? 'text-amber-700' :
                    'text-slate-600'
                  }`}>
                    {isComplete ? 'Funds Successfully Released' :
                     isRejected ? 'Request Rejected by Verifier' :
                     isVerified ? 'Verified & Ready for Manager' :
                     hasProof ? 'Evidence Submitted - Awaiting Review' :
                     'Action Required: Waiting for Evidence'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-slate-100">
                    ID: #{req.id}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                {/* Left: Info */}
                <div className="space-y-6 flex-1 w-full">

                  {/* Title & Description */}
                  <div className="space-y-4">
                    {req.title && <h3 className="text-xl font-bold text-gray-900 tracking-tight">{req.title}</h3>}
                    {req.description && (
                      <p className="text-sm font-medium text-slate-500 leading-relaxed whitespace-pre-wrap">
                        {req.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-6 pt-2">
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
                        {isSupplier && <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">You</span>}
                      </div>
                      {hasProof && (
                        <button 
                          onClick={() => openIPFS(req.proofCID)}
                          className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <ImageIcon size={14} />
                          <span className="text-xs">View Proof</span>
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action Area */}
                <div className="flex flex-col items-stretch md:items-end justify-end min-w-[200px] gap-4 pt-4 md:pt-0 mt-6 md:mt-0">
                  {/* === DONOR SECTION === */}
                  {!isManager && !isSupplier && !isVerifier && !isComplete && (
                    <div className="flex flex-col gap-3 w-full">
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

                  {/* === SUPPLIER SECTION === */}
                  {isSupplier && !isComplete && !isRejected && (
                    <div className="flex flex-col gap-2 w-full min-w-[200px]">
                      {!hasProof ? (
                        <>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => handleFileChange(e)}
                          />
                          {localProof ? (
                            <button
                              onClick={() => handleSubmitProof(req.id, `ipfs://${localProof}`)}
                              disabled={processingId === req.id || isRelaying}
                              className="w-full h-[52px] bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                            >
                              {processingId === req.id ? <span className="animate-spin">🌀</span> : <CheckCircle2 size={14} />}
                              Submit Proof to Chain
                            </button>
                          ) : (
                            <button
                              onClick={() => startUpload(address, req.id)}
                              disabled={uploadingTaskId === taskKey}
                              className="w-full h-[52px] bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                              {uploadingTaskId === taskKey ? <span className="animate-spin">🌀</span> : <Camera size={14} />}
                              {uploadingTaskId === taskKey ? 'Uploading...' : 'Upload Proof (Image)'}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-bold uppercase tracking-widest text-[10px] text-center flex flex-col items-center justify-center gap-1">
                          <CheckCircle2 size={14} />
                          <span>Proof Submitted</span>
                          <span className="text-[8px] normal-case tracking-normal">Awaiting verification</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* === VERIFIER SECTION === */}
                  {isVerifier && !isComplete && !isVerified && !isRejected && (
                    <div className="flex flex-col gap-2 w-full min-w-[200px]">
                      {!hasProof ? (
                        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl font-bold uppercase tracking-widest text-[10px] text-center flex flex-col items-center justify-center gap-1">
                          <Clock size={14} />
                          <span>Waiting for Supplier</span>
                          <span className="text-[8px] normal-case tracking-normal italic">Proof required to verify</span>
                        </div>
                      ) : (
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => handleVerify(req.id)}
                            disabled={processingId === req.id || isRelaying}
                            className="flex-1 h-[52px] bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                          >
                            {processingId === req.id ? <span className="animate-spin">🌀</span> : <ShieldCheck size={14} />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={processingId === req.id || isRelaying}
                            className="flex-1 h-[52px] bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                          >
                            {processingId === req.id ? <span className="animate-spin">🌀</span> : <XCircle size={14} />}
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* === MANAGER SECTION === */}
                  {isManager && !isComplete && (
                    <div className="flex flex-col items-center md:items-end gap-3">
                      <button
                        onClick={() => handleFinalize(req.id)}
                        disabled={!canFinalize || processingId === req.id || isRelaying}
                        className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg flex items-center gap-2 ${
                          canFinalize
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 hover:-translate-y-1'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {processingId === req.id ? (
                          <><span className="animate-spin">🌀</span> {isRelaying ? 'AI Finalizing...' : 'Loading...'}</>
                        ) : (
                          'Finalize & Pay'
                        )}
                      </button>
                      
                      <div className="flex flex-col items-center md:items-end gap-1.5">
                        {!isVerified && !isRejected && (
                          <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1.5">
                            <Clock size={12} /> Awaiting Verification
                          </span>
                        )}
                        {isVerified && !canFinalize && (
                          <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1.5">
                            <Users size={12} /> Awaiting Donor Approvals
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1.5">
                            <XCircle size={12} /> Rejected by Verifier
                          </span>
                        )}
                        {!canFinalize && (
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                            <AlertCircle size={12} />
                            Needs {Math.floor(Number(donorsCount) / 2 + 1)} votes
                          </div>
                        )}
                        {canFinalize && !isRelaying && (
                          <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-tight flex items-center gap-1.5">
                            <Zap size={10} fill="currentColor" /> AI Relayer Ready
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* === COMPLETED SECTION === */}
                  {isComplete && (
                    <div className="flex flex-col items-center md:items-end gap-2">
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-emerald-100">
                        <CheckCircle2 size={18} />
                        Funds Released
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Transaction Confirmed</span>
                    </div>
                  )}
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
