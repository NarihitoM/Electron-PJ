import { useQuery } from "@tanstack/react-query";
import { agentauth } from "../api/api";
import type { nodedata } from "../types/type";

export const useAgentNodes = () => {
  return useQuery<nodedata[]>({
    queryKey: ["node"],
    queryFn: async () => {
      const response = await agentauth.fetchnode();
      if (!response.success) throw new Error(response.message || "Failed to fetch nodes");
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
