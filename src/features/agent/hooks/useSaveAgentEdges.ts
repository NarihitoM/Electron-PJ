import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentauth } from "../api/api";

export const useSaveAgentEdges = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (edges: { source: string; target: string }[]) => {
      const response = await agentauth.saveedges(edges);
      if (!response.success) throw new Error(response.message || "Failed to save edges");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edges"] });
    },
  });
};
