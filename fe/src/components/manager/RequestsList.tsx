import React, { useState } from 'react';
import { useRequests } from '../../hooks/useRequests';
import { ABIS } from '../../blockchain/constants';
import {
  CheckCircle2,
  Wallet,
  Users,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  ExternalLink,
  Image as ImageIcon,
  Clock,
  XCircle,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { Link } from 'react-router-dom';
import { encodeFunctionData, formatEther } from 'viem';
import { publicClient, getWalletClient } from '../../blockchain/client';
import { useRelayer } from '../../hooks/useRelayer';
import { useSupplierEvidence } from '../../hooks/useSupplierEvidence';

import { useNotification } from '../../context/NotificationContext';

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
  const [localPendingVoteIds, setLocalPendingVoteIds] = useState<Set<number>>(new Set());
  const { executeGasless, isRelaying } = useRelayer();
  const toast = useNotification();
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

  // --- AI Vote (Gasless, queued) ---
  const handleApprove = async (index: number) => {
    if (!userAddress) return;
    setProcessingId(index);
    try {
      toast.info(`Initiating AI Vote for request #${index}...`);
      
      const data = encodeFunctionData({
        abi: ABIS.CAMPAIGN,
        functionName: 'approveRequest',
        args: [BigInt(index)],
      });
      
      const result = await executeGasless(address, data);
      toast.success('Vote submitted to AI Relayer! It will appear on-chain shortly.');
      
      // Update local state for immediate feedback
      setLocalPendingVoteIds(prev => new Set(prev).add(index));
      
      refresh();
    } catch (err: any) {
      console.error('[AI Vote] Failed:', err);
      if (err.message?.includes('User rejected')) {
        toast.warning('Voting signature denied.');
      } else {
        toast.error(err.message || 'AI Relayer failed. Please try Direct Vote.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  // --- Direct Approve (Self-paid gas) ---
  const handleApproveAsValidator = async (index: number) => {
    if (!window.ethereum) return;
    setProcessingId(index);
    try {
      const walletClient = getWalletClient();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const userAccount = accounts[0];

      if (!walletClient || !userAccount) throw new Error('Wallet not connected');

      const { request } = await publicClient.simulateContract({
        account: userAccount as `0x${string}`,
        address: address as `0x${string}`,
        abi: ABIS.CAMPAIGN,
        functionName: 'approveAsValidator',
        args: [BigInt(index)],
      });

      const hash = await walletClient.writeContract(request);
      toast.info('Validation signature sent. Waiting for block confirmation...');
      
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success('Validation successful! You have approved this request as an inspector.');
      refresh();
    } catch (err: any) {
      console.error('Validation failed:', err);
      toast.error(err.message || 'Failed to approve as validator');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveDirect = async (index: number) => {
    if (!userAddress) return;
    setProcessingId(index);
    try {
      toast.info('Opening MetaMask for direct vote...');
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
      toast.success('Transaction sent! Waiting for block confirmation...');
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success('Vote recorded on-chain!');
      refresh();
    } catch (err: any) {
      console.error('Direct Approval failed:', err);
      if (err.message?.includes('User rejected')) {
        toast.warning('Transaction cancelled by user.');
      } else {
        toast.error(err.shortMessage || err.message || 'Direct Vote failed.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  // --- Finalize & Pay (Manager only, Direct Gas) ---
  const handleFinalize = async (index: number) => {
    if (!userAddress) return;
    setProcessingId(index);
    try {
      toast.info('Opening MetaMask to finalize & release funds...');
      const walletClient = getWalletClient();
      if (!walletClient) throw new Error('Wallet client not found');

      const { request } = await publicClient.simulateContract({
        account: userAddress as `0x${string}`,
        address: address as `0x${string}`,
        abi: ABIS.CAMPAIGN,
        functionName: 'finalizeRequest',
        args: [BigInt(index)],
      });
      
      const hash = await walletClient.writeContract(request);
      
      toast.info('Finalization submitted! Mining on-chain...');
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success('Funds released successfully!');
      refresh();
    } catch (err: any) {
      console.error('Finalization failed:', err);
      if (err.message?.includes('User rejected')) {
        toast.warning('Transaction cancelled by user.');
      } else {
        toast.error(err.shortMessage || err.message || 'Failed to release funds.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/40 border border-white/10 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Loading Requests...</p>
      </div>
    );
  }

  // --- Empty State ---
  if (requests.length === 0 && pendingCreations.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/40 border border-white/10 text-center space-y-4">
        <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Spending Requests</h2>
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem]">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
            <LayoutDashboard size={24} />
          </div>
          <p className="text-white/60 font-bold">No active requests found</p>
          <p className="text-sm text-white/30">The manager hasn't created any spending requests yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldCheck size={28} className="text-blue-400" />
          Spending Requests
        </h2>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-1 ml-10">
          Community Governance in Action
        </p>
      </div>

      {/* Pending Creations Cards */}
      {pendingCreations.map((pIdx) => (
        <div 
          key={`pending-cre-${pIdx}`}
          className="bg-gradient-to-br from-indigo-900/60 to-slate-900/80 rounded-[2.5rem] p-8 shadow-xl border border-indigo-500/20 animate-pulse"
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
              <h3 className="text-2xl font-black text-white/60">Initializing Request...</h3>
              <p className="text-sm text-indigo-300/60 font-medium leading-relaxed max-w-2xl">
                Your spending request has been accepted by the AI Relayer. It is currently being batched for optimal gas efficiency and will appear on-chain shortly.
              </p>
            </div>
            <div className="bg-indigo-500/10 p-6 rounded-3xl border border-indigo-500/20 text-center min-w-[180px]">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">AI Optimizing Gas</p>
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
          const isValidatorSelected = req.selectedValidators?.some(v => v.toLowerCase() === userAddress?.toLowerCase());
          const validatorApproved = req.selectedValidators.length > 0 && req.validatorApprovalCount >= 2;
          const communityApproved = currentAmount > targetAmount;
          const canFinalize = (validatorApproved || communityApproved) && isVerified;
          
          const isEligible = userDonorId > BigInt(0) && userDonorId <= req.snapshotDonorCount;
          const isVoted = votedRequestIds.has(req.id);
          const isPending = pendingRequestIds.has(req.id) || localPendingVoteIds.has(req.id);

          const isSupplier = userAddress?.toLowerCase() === req.recipient.toLowerCase();
          const isVerifier = userAddress?.toLowerCase() === req.verifier.toLowerCase();

          const hasProof = req.proofCID && req.proofCID !== "";
          const taskKey = `${address}-${req.id}`;
          const localProof = uploadedEvidences[taskKey];

          return (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/30 border border-white/10 hover:border-white/20 transition-shadow group relative overflow-hidden"
            >
              {/* Status Banner */}
              <div className={`-mx-8 -mt-8 mb-6 px-8 py-5 flex items-center justify-between border-b transition-all duration-500 shadow-lg ${
                isComplete ? 'bg-emerald-500/90 border-emerald-400 shadow-emerald-500/40' :
                isRejected ? 'bg-rose-500/90 border-rose-400 shadow-rose-500/40' :
                isVerified ? 'bg-blue-500/90 border-blue-400 shadow-blue-500/40' :
                hasProof ? 'bg-amber-500/90 border-amber-400 shadow-amber-500/40' :
                (validatorApproved || communityApproved) ? 'bg-indigo-500/90 border-indigo-400 shadow-indigo-500/40' :
                'bg-cyan-600/90 border-cyan-400 shadow-cyan-500/30'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-md ${
                    isComplete || isRejected || isVerified || hasProof || (validatorApproved || communityApproved)
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/20 text-white'
                  }`}>
                    {isComplete ? <CheckCircle2 size={24} strokeWidth={3} /> : 
                     isRejected ? <XCircle size={24} strokeWidth={3} /> :
                     isVerified ? <Zap size={24} strokeWidth={3} /> :
                     hasProof ? <ShieldCheck size={24} strokeWidth={3} /> :
                     (validatorApproved || communityApproved) ? <Users size={24} strokeWidth={3} /> :
                     <RefreshCw size={24} strokeWidth={3} className="animate-spin-slow" />}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] drop-shadow-md text-white">
                      {isComplete ? 'Execution Complete' : 
                       isRejected ? 'Request Rejected' :
                       isVerified ? 'Verification Passed' :
                       hasProof ? 'Proof Pending Review' :
                       (validatorApproved || communityApproved) ? 'Governance Approved' :
                       'Voting in Progress'}
                    </h4>
                    {req.selectedValidators.length > 0 && !isComplete && !isRejected && (
                      <p className="text-[9px] font-black uppercase mt-0.5 tracking-tight text-white/80">
                        Inspector Path: <span className="underline decoration-white/30">{req.validatorApprovalCount}/3 Approved</span>
                      </p>
                    )}
                  </div>
                </div>



                <div className="flex items-center gap-4">
                  {isSupplier && (
                    <Link to="/supplier" className="text-[9px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 transition-colors">
                      Open Task Queue
                    </Link>
                  )}
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
                    {req.title && <h3 className="text-xl font-bold text-white tracking-tight">{req.title}</h3>}
                    {req.description && (
                      <p className="text-sm font-medium text-white/50 leading-relaxed whitespace-pre-wrap">
                        {req.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <Wallet size={16} />
                        <span>{req.value} ETH</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 font-bold">
                        <Users size={16} className="text-blue-400" />
                        <span className="flex items-center gap-1.5">
                          {req.voterCount} {req.voterCount === 1 ? 'Approval' : 'Approvals'}
                          <span className="text-[10px] font-normal text-white/30">({formatEther(BigInt(req.approvalWeights))} ETH)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                        <ArrowUpRight size={14} />
                        <span className="font-mono text-xs truncate max-w-[120px]">{req.recipient}</span>
                        {isSupplier && <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">You</span>}
                      </div>
                      {hasProof && (
                        <button
                          onClick={() => openIPFS(req.proofCID)}
                          className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
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
                <div className="flex flex-col items-stretch md:items-end justify-end min-w-[220px] gap-4 pt-4 md:pt-0 mt-6 md:mt-0">
                  
                  {/* === VOTING SECTION (For everyone EXCEPT Manager, if they donated) === */}
                  {!isManager && !isComplete && !isRejected && (
                    <div className="flex flex-col gap-3 w-full">
                      {/* 1. Already voted on-chain */}
                      {isVoted && (
                        <div className="w-full flex items-center justify-center gap-2 text-blue-600 bg-blue-50 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-blue-100 animate-in fade-in duration-500">
                          <CheckCircle2 size={16} />
                          Voted (Confirmed)
                        </div>
                      )}

                      {/* 2. Pending in AI queue (This should hide buttons) */}
                      {!isVoted && isPending && (
                        <div className="w-full h-[116px] px-4 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl font-black uppercase tracking-widest text-[10px] text-center flex flex-col items-center justify-center gap-2 shadow-sm animate-pulse">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🕒</span>
                            <span>Pending AI Execution</span>
                          </div>
                          <span className="text-[8px] normal-case tracking-normal font-medium text-indigo-400">
                            Your vote is safely queued in the AI Relayer
                          </span>
                        </div>
                      )}

                      {/* 3. Not eligible (Hasn't donated or joined late) */}
                      {!isVoted && !isPending && !isEligible && (
                        <div className="w-full px-4 py-3 bg-white/5 border-2 border-dashed border-white/10 text-white/40 rounded-xl font-bold uppercase tracking-widest text-[10px] text-center flex flex-col items-center justify-center gap-1">
                          <span className="text-white/50">Not Eligible</span>
                          {!hasDonated ? (
                            <span className="text-[8px] normal-case tracking-normal">Must donate to vote</span>
                          ) : (
                            <span className="text-[8px] normal-case tracking-normal">Donated after request</span>
                          )}
                        </div>
                      )}

                      {/* 4. Eligible — Show vote buttons (Hidden if Pending or Voted) */}
                      {!isVoted && !isPending && (isEligible || isValidatorSelected) && (
                        <>
                          {isValidatorSelected ? (
                            <button
                              onClick={() => handleApproveAsValidator(req.id)}
                              disabled={processingId !== null}
                              className="w-full h-[52px] px-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2"
                            >
                              <ShieldCheck size={14} />
                              Validate as Inspector
                            </button>
                          ) : (
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
                                    <><Zap size={14} className="text-amber-400" /> Direct Vote</>
                                  )}
                                </div>
                                <span className="text-[8px] text-gray-400 normal-case tracking-normal font-medium mt-0.5">Self-paid Gas (Fast)</span>
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
                                    <><ShieldCheck size={14} className="text-emerald-300" /> AI Vote</>
                                  )}
                                </div>
                                <span className="text-[8px] text-blue-200 normal-case tracking-normal font-medium mt-0.5">Free Gas (Delayed)</span>
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* === REDIRECT LINKS FOR PROFESSIONAL ROLES (Supplier/Verifier) === */}
                  {!isComplete && !isRejected && (
                    <div className="flex flex-col gap-2 w-full">
                      {isSupplier && !hasProof && (
                        <Link
                          to="/supplier"
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-100 transition-all border border-emerald-100"
                        >
                          <Camera size={14} />
                          Open Supplier Portal to Upload
                        </Link>
                      )}
                      {isVerifier && hasProof && !isVerified && (
                        <Link
                          to="/verifier"
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-100 transition-all border border-indigo-100"
                        >
                          <ShieldCheck size={14} />
                          Open Verifier Hub to Review
                        </Link>
                      )}
                    </div>
                  )}

                  {/* === FINALIZATION SECTION (Manager Only) === */}
                  {isManager && !isComplete && !isRejected && (
                    <div className="flex flex-col items-center md:items-end gap-3 w-full">
                      <button
                        onClick={() => handleFinalize(req.id)}
                        disabled={!canFinalize || processingId !== null}
                        className={`w-full h-[52px] px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg flex items-center justify-center gap-2 ${
                          canFinalize
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 hover:-translate-y-0.5'
                            : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                        }`}
                      >
                        {processingId === req.id ? (
                          <><span className="animate-spin">🌀</span> Processing...</>
                        ) : (
                          <><Zap size={14} fill={canFinalize ? "currentColor" : "none"} /> Finalize & Release Funds</>
                        )}
                      </button>
                      
                      <div className="flex flex-col items-end gap-1.5 pr-2">
                        {!isVerified && !isRejected && (
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={12} /> Awaiting Verification
                          </span>
                        )}
                        {!canFinalize && !isRejected && (
                          <div className="flex flex-col items-end gap-1">
                            {req.selectedValidators.length > 0 && req.validatorApprovalCount < 2 && (
                              <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck size={12} /> Needs {2 - req.validatorApprovalCount} more Inspector Approvals
                              </span>
                            )}
                            {currentAmount <= targetAmount && (
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Users size={12} /> Needs {((targetAmount - currentAmount) + 0.0001).toFixed(4)} ETH Approval
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* === COMPLETED STATUS === */}
                  {isComplete && (
                    <div className="flex flex-col items-center md:items-end gap-2">
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-emerald-500/20">
                        <CheckCircle2 size={18} />
                        Funds Released
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Transaction Confirmed</span>
                    </div>
                  )}

                  {/* === REJECTED STATUS === */}
                  {isRejected && (
                    <div className="flex flex-col items-center md:items-end gap-2">
                      <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-rose-100">
                        <XCircle size={18} />
                        Request Rejected
                      </div>
                      <span className="text-[9px] font-bold text-rose-400 uppercase">By Security Verifier</span>
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
