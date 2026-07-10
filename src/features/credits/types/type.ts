export interface CreditBalance {
  credits: number;
  creditsUpdatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  provider: string | null;
  model: string | null;
  createdAt: string;
}

export interface CreditHistoryResponse {
  success: boolean;
  transactions: CreditTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
