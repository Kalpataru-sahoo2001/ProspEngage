export interface ApprovalRequest {
    userId: number;
    roleId: number;
    profileId: number;
    statusId: number;
    isApproved: boolean;
    approvedBy: string;
  }