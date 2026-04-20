import React from 'react';
import SpendingRequestCard from './SpendingRequestCard';
import type { SpendingRequest } from '../../types/campaigndetail';

interface SpendingRequestsProps {
  requests: SpendingRequest[];
}

const SpendingRequests: React.FC<SpendingRequestsProps> = ({ requests }) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl mt-10 border border-blue-600/20">
      <div className="bg-blue-700 py-4 px-8">
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Spending Requests
        </h2>
      </div>
      <div className="bg-blue-50/50 p-6">
        {requests.map((req) => (
          <SpendingRequestCard key={req.id} request={req} />
        ))}
      </div>
    </div>
  );
};

export default SpendingRequests;
