import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentauth } from "../api/api";

export const useSaveNodePositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (positions: { nodeid: string; posX: number; posY: number }[]) => {
      const response = await agentauth.savepositions(positions);
      if (!response.success) throw new Error(response.message || "Failed to save positions");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["node"] });
    },
  });
};
