import { useQuery } from "@tanstack/react-query";
import { dashboardapi } from "../api/api";
import type { DashboardStats } from "../types/type";

export const useDashboardStats = () => {
  return useQuery<DashboardStats, Error>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await dashboardapi.fetchStats();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to load dashboard stats");
      }
      return response.data;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
