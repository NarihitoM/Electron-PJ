import { Server } from "../../../shared/config/axioconfig";
import type { CreditBalance, CreditHistoryResponse } from "../types/type";

export const creditApi = {
  getBalance: async (): Promise<{ success: boolean; data: CreditBalance }> => {
    const response = await Server.get("/credits/balance");
    return response.data;
  },

  getHistory: async (page: number = 1, limit: number = 20): Promise<CreditHistoryResponse> => {
    const response = await Server.get(`/credits/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  purchaseCredits: async (amount: number): Promise<{ success: boolean; message: string }> => {
    const response = await Server.post("/credits/purchase", { amount });
    return response.data;
  },
};
