import { Server } from "../../../shared/config/axioconfig";
import { UsageApiResponse } from "../types";

export interface LogUsageRequest {
    provider: string;
    model: string;
    agent: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    success: boolean;
}

export const usageapi = {
    fetchStats: async (period: string = "month", from?: string, to?: string, page?: number, limit?: number, tzOffset?: number): Promise<UsageApiResponse> => {
        const params = new URLSearchParams({ period });
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        if (page !== undefined) params.append("page", String(page));
        if (limit !== undefined) params.append("limit", String(limit));
        if (tzOffset !== undefined) params.append("tzOffset", String(tzOffset));
        const response = await Server.get(`/dashboard/api/usage?${params.toString()}`);
        return response.data;
    },
    logUsage: async (data: LogUsageRequest): Promise<void> => {
        await Server.post("/dashboard/api/usage/log", data);
    },
};
