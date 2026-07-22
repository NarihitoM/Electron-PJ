import { useQuery } from "@tanstack/react-query";
import { agentauth } from "../api/api";
import type { FlowEdgeData } from "../types/type";

export const useAgentEdges = () => {
  return useQuery<FlowEdgeData[]>({
    queryKey: ["edges"],
    queryFn: async () => {
      const response = await agentauth.fetchedges();
      if (!response.success) throw new Error(response.message || "Failed to fetch edges");
      // Backend returns { id, sourceNodeId, targetNodeId }[] — map to FlowEdgeData
      const raw: any[] = response.data ?? [];
      return raw.map((e) => ({
        id: e.id || `e-${e.sourceNodeId}-${e.targetNodeId}`,
        source: e.sourceNodeId,
        target: e.targetNodeId,
      }));
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
