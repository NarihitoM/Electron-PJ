import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentauth } from "../api/api";

export const useCreateAgentNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      provider,
      actor,
      model,
      tool,
      prompt,
    }: {
      name: string;
      provider: string;
      actor: string;
      model: string;
      tool: string;
      prompt: string;
    }) => agentauth.addnode(name, provider, actor, model, tool, prompt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["node"] });
      queryClient.refetchQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
