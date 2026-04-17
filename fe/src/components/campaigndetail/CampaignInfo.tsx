import React from 'react';

interface CampaignInfoProps {
  title: string;
  description: string;
  raised: string;
  goal: string;
  progressPercent: number | string;
}

const CampaignInfo: React.FC<CampaignInfoProps> = ({
  title,
  description,
  raised,
  goal,
  progressPercent,
}) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-white/70 relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <div className="w-24 h-1 bg-blue-600 rounded-full"></div>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-gray-500 text-base leading-relaxed border-b border-dotted border-gray-300 pb-2">
          {description}
        </p>
        <p className="text-gray-500 text-base leading-relaxed border-b border-dotted border-gray-300 pb-2">
          &nbsp;
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-lg font-bold italic text-gray-800">Fundraising</span>
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">{raised}</span>
            <span className="text-gray-500 font-medium">/{goal}</span>
          </div>
        </div>
        
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000"
            style={{ width: `${typeof progressPercent === 'number' ? progressPercent : 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CampaignInfo;
