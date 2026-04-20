import React, { useState } from 'react';
import { useRequests } from '../../hooks/useRequests';
import { publicClient } from '../../blockchain/client';
import { ABIS } from '../../blockchain/constants';
import { 
  CheckCircle2, 
  Wallet, 
  Users, 
  AlertCircle,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { encodeFunctionData } from 'viem';

interface RequestsListProps {
  address: string;
  isManager: boolean;
  donorsCount: string | number;
}

const RequestsList: React.FC<RequestsListProps> = ({ address, isManager, donorsCount }) => {
  const { requests, isLoading, refresh } = useRequests(address);
  const { address: userAddress } = useWallet();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleApprove = async (index: number) => {
    if (!window.ethereum || !userAddress) return;
    setProcessingId(index);
    try {
      const data = encodeFunctionData({
        abi: ABIS.CAMPAIGN,
        functionName: 'approveRequest',
        args: [BigInt(index)],
      });

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from: userAddress, to: address, data }],
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
      refresh();
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFinalize = async (index: number) => {
    if (!window.ethereum || !userAddress) return;
    setProcessingId(index);
    try {
      const data = encodeFunctionData({
        abi: ABIS.CAMPAIGN,
        functionName: 'finalizeRequest',
        args: [BigInt(index)],
      });

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from: userAddress, to: address, data }],
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
      refresh();
    } catch (err) {
      console.error('Finalization failed:', err);
    } finally {
      setProcessingId(null);
    }
  };


  if (isLoading && requests.length === 0) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-600" />
            Spending Requests
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Community Governance in Action</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold italic">No spending requests have been created yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => {
            const isComplete = req.complete;
            const canFinalize = !isComplete && Number(req.approvalWeights) > (Number(donorsCount) / 2);

            return (
              <div key={req.id} className={`bg-white rounded-[2.5rem] p-8 border transition-all duration-300 ${isComplete ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100 shadow-sm hover:shadow-xl'}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {isComplete ? 'Paid & Complete' : 'Under Review'}
                      </span>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID: #{req.id}</span>
                    </div>
                    
                    <h3 className="text-xl font-extrabold text-gray-900 leading-tight">{req.description}</h3>
                    
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <Wallet size={16} className="text-blue-500" />
                        <span>{req.value} ETH</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <Users size={16} className="text-blue-500" />
                        <span>{req.approvalWeights} Approvals</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg">
                        <ArrowUpRight size={14} />
                        <span className="font-mono text-xs truncate max-w-[120px]">{req.recipient}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Donor Button */}
                    {!isManager && !isComplete && (
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={processingId === req.id}
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                      >
                        {processingId === req.id ? 'Processing...' : 'Approve'}
                      </button>
                    )}

                    {/* Manager Button */}
                    {isManager && !isComplete && (
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => handleFinalize(req.id)}
                          disabled={!canFinalize || processingId === req.id}
                          className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${
                            canFinalize 
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {processingId === req.id ? 'Loading...' : 'Finalize & Pay'}
                        </button>
                        {!canFinalize && (
                          <div className="flex items-center gap-1 text-[9px] text-amber-500 font-bold uppercase tracking-wider">
                            <AlertCircle size={10} />
                            Needs {Math.floor(Number(donorsCount)/2 + 1)} votes
                          </div>
                        )}
                      </div>
                    )}

                    {isComplete && (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">
                        <CheckCircle2 size={16} />
                        Funds Released
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequestsList;
