import React, { useState } from 'react';
import { parseEther } from 'viem';
import { getWalletClient, publicClient } from '../../blockchain/client';
import { ABIS } from '../../blockchain/constants';
import { useWallet } from '../../hooks/useWallet';

interface DonateSidebarProps {
  campaignAddress: string | undefined;
  donors: number;
  goal: string;
  deadline: string;
  onSuccess?: () => void;
}

const DonateSidebar: React.FC<DonateSidebarProps> = ({
  campaignAddress,
  donors,
  goal,
  deadline,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { isConnected, connect } = useWallet();

  const handleDonate = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!campaignAddress || !amount || isNaN(Number(amount))) return;

    setIsPending(true);
    try {
      const walletClient = getWalletClient();
      if (!walletClient) throw new Error('No wallet client found');

      const [address] = await walletClient.getAddresses();

      const { request } = await publicClient.simulateContract({
        account: address,
        address: campaignAddress as `0x${string}`,
        abi: ABIS.CAMPAIGN,
        functionName: 'donate',
        value: parseEther(amount),
      });

      const hash = await walletClient.writeContract(request);
      
      // Wait for transaction to be processed
      await publicClient.waitForTransactionReceipt({ hash });
      
      setAmount('');
      alert('Donation successful! Thank you.');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Donation error:', err);
      alert(`Donation failed: ${err.shortMessage || err.message}`);
    } finally {
      setIsPending(false);
    }
  };

  const quickAmounts = ['0.01', '0.05', '0.1'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/70 h-fit sticky top-[76px]">
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-gray-500 font-medium italic">Donors</span>
          <span className="text-xl font-bold text-gray-900">{donors.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-gray-500 font-medium italic">Goal</span>
          <span className="text-xl font-bold text-gray-900">{goal}</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-gray-500 font-medium italic">Deadline</span>
          <span className="text-xl font-bold text-gray-900">{deadline}</span>
        </div>
      </div>

      <div className="flex justify-center gap-6 mb-8 py-2">
        <div className="p-3 bg-blue-50 rounded-full text-blue-500 shadow-sm border border-blue-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="p-3 bg-purple-50 rounded-full text-purple-500 shadow-sm border border-purple-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="p-3 bg-emerald-50 rounded-full text-emerald-500 shadow-sm border border-emerald-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Amount (ETH)</label>
        <div className="grid grid-cols-3 gap-3">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt)}
              className={`py-2 border border-gray-200 rounded-lg text-sm font-semibold transition-all hover:border-emerald-400 hover:bg-emerald-50/50 ${
                amount === amt ? 'bg-emerald-50 border-emerald-400 text-emerald-600' : 'text-gray-600'
              }`}
            >
              {amt}
            </button>
          ))}
        </div>
        
        <input
          type="number"
          placeholder="Other Amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all font-medium"
        />

        <button
          onClick={handleDonate}
          disabled={isPending || !amount}
          className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${
            isPending || !amount 
              ? 'bg-gray-300 shadow-none cursor-not-allowed' 
              : 'bg-emerald-400 hover:bg-emerald-500 shadow-emerald-400/30'
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : isConnected ? 'Donate now' : 'Connect to Donate'}
        </button>
      </div>
    </div>
  );
};

export default DonateSidebar;
