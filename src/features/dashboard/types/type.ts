export interface DashboardStats {
  totalChats: number;
  activeProviders: string[];
  totalAgentNodes: number;
  connectedServices: string[];
}

export interface Apiresponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}
export type DashboardApiResponse = Apiresponse<DashboardStats>;

export interface DashboardClientState {
  resetDashboard: () => void;
}
