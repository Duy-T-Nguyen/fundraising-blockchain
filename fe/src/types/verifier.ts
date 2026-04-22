export type VerificationTaskType = 'EXPERT_SIGNATURE' | 'COMMUNITY_VOTE';

export interface VerifierTask {
  id: string; // unique id campaignAddress-index-milestone
  campaignAddress: `0x${string}`;
  campaignName: string;
  requestIndex: number;
  description: string;
  value: string;
  recipient: `0x${string}`;
  evidenceHash: string;
  type: VerificationTaskType;
  status: 'PENDING' | 'COMPLETED';
  milestoneIndex?: number;
  isMultiStage: boolean;
}

export interface VerifierStats {
  totalTasks: number;
  pendingExpert: number;
  pendingCommunity: number;
  completedCount: number;
}
