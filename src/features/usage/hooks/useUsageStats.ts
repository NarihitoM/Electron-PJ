import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usageapi } from "../api/api";
import { usagestore } from "../store/store";
import type { UsageStats } from "../types/type";

function buildDateRange(period: string, selectedYear: number) {
  const now = new Date();
  const year = selectedYear > 0 ? selectedYear : now.getFullYear();
  const pad = (n: number) => String(n).padStart(2, "0");
  let from: string, to: string;
  switch (period) {
    case "day": {
      const d = `${year}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      from = d;
      to = `${d}T23:59:59.999Z`;
      break;
    }
    case "week": {
      const end = new Date(year, now.getMonth(), now.getDate());
      const start = new Date(end.getTime() - 6 * 86400000);
      from = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
      to = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T23:59:59.999Z`;
      break;
    }
    case "month": {
      const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
      from = `${year}-${pad(now.getMonth() + 1)}-01`;
      to = `${year}-${pad(now.getMonth() + 1)}-${daysInMonth}T23:59:59.999Z`;
      break;
    }
    case "year":
      from = `${year}-01-01`;
      to = `${year}-12-31T23:59:59.999Z`;
      break;
    default:
      from = `${year}-01-01`;
      to = `${year}-12-31T23:59:59.999Z`;
  }
  return { from, to };
}

export const useUsageStats = () => {
  const { period, selectedYear } = usagestore();
  const { from, to } = buildDateRange(period, selectedYear);

  return useQuery<UsageStats>({
    queryKey: ["usage-stats", period, selectedYear],
    queryFn: async () => {
      const response = await usageapi.fetchStats(
        period,
        from,
        to,
        1,
        20,
        new Date().getTimezoneOffset(),
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to load usage data");
      }
      return response.data;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useRecentActivity = (page: number, limit: number = 20) => {
  const { period, selectedYear } = usagestore();
  const { from, to } = buildDateRange(period, selectedYear);

  return useQuery<UsageStats>({
    queryKey: ["recent-activity", period, selectedYear, page, limit],
    queryFn: async () => {
      const response = await usageapi.fetchStats(
        period,
        from,
        to,
        page,
        limit,
        new Date().getTimezoneOffset(),
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to load usage data");
      }
      return response.data;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    retry: false,
  });
};
