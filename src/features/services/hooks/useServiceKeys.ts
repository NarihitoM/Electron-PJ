import { useQuery } from "@tanstack/react-query";
import { serviceauth } from "../api/api";
import type { Servicefetch } from "../types/type";

export const useServiceKeys = () => {
  return useQuery<Servicefetch[]>({
    queryKey: ["key"],
    queryFn: async () => {
      const response = await serviceauth.servicefetch();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch service keys");
      }
      const data = response.data ?? [];
      // Always include MultimateAi Free tier so it appears as a selectable provider
      if (!data.some((s) => s.provider === "zen")) {
        (data as any).push({ id: 0, provider: "zen", apiKey: "", host: undefined });
      }
      return data;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
};
