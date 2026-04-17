import React from 'react';
import type { SpendingRequest } from '../../types/campaigndetail';

interface SpendingRequestCardProps {
  request: SpendingRequest;
}

const SpendingRequestCard: React.FC<SpendingRequestCardProps> = ({ request }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-grow">
          <h4 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">
            Request #{request.id}: {request.title}
          </h4>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-gray-800">
              Amount: <span className="font-bold">${request.amount}</span>
            </p>
            <p className="text-sm text-gray-500 italic">
              Description: {request.description}
            </p>
            <div className="w-full border-b border-dotted border-gray-300 my-2"></div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-6 min-w-[140px]">
          <div className="flex gap-2">
            <button className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm shadow-emerald-400/20">
              Approve
            </button>
            <button className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm">
              Reject
            </button>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all text-sm shadow-md shadow-blue-600/20">
            View Proposal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpendingRequestCard;
