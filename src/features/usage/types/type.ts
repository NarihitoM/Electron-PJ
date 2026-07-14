export interface UsageSummary {
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  totalRequests: number;
  avgLatency: number;
}

export interface UsageByTime {
  date: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  requests: number;
}

export interface UsageByProvider {
  provider: string;
  tokens: number;
  cost: number;
  requests: number;
}

export interface UsageByAgent {
  agent: string;
  tokens: number;
  cost: number;
  requests: number;
}

export interface UsageRecent {
  id: number;
  provider: string;
  model: string;
  agent: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  latencyMs: number;
  success: boolean;
  fallbackFrom: string | null;
  createdAt: Date;
}

export interface UsageStats {
  summary: UsageSummary;
  byTime: UsageByTime[];
  byProvider: UsageByProvider[];
  byAgent: UsageByAgent[];
  recent: UsageRecent[];
  recentTotal?: number;
  availableYears: { min: number; max: number };
}

export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export type UsageApiResponse = ApiResponse<UsageStats>;

export interface UsageClientState {
  period: "day" | "week" | "month" | "year";
  selectedYear: number;
  recentPage: number;
  recentLimit: number;
  setPeriod: (period: "day" | "week" | "month" | "year") => void;
  setSelectedYear: (year: number) => void;
  setRecentPage: (page: number) => void;
  resetUsage: () => void;
}
