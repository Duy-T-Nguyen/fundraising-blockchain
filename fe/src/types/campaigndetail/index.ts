// Shared types for the CampaignDetail feature
export interface SpendingRequest {
  id: string;
  title: string;
  amount: string;
  description: string;
}

export interface CampaignDetailData {
  id: number;
  title: string;
  description: string;
  raised: string;
  goal: string;
  progressPercent: number;
  donors: number;
  deadline: string;
  spendingRequests: SpendingRequest[];
}
