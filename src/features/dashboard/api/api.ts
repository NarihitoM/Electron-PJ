import { Server } from "../../../shared/config/axioconfig"
import { DashboardApiResponse } from "../types/type";

export const dashboardapi = {
    fetchStats: async (): Promise<DashboardApiResponse> => {
        const response = await Server.get("/dashboard/api/stats")
        return response.data;
    }
}
