import { useMutation } from "@tanstack/react-query";
import { agentauth } from "../api/api";

export const useStoreAgentMessage = () => {
  return useMutation({
    mutationFn: ({
      role,
      content,
      name,
      provider,
      model,
    }: {
      role: string;
      content: string;
      name?: string;
      provider?: string;
      model?: string;
    }) => agentauth.storeagentmessage(role, content, name, provider, model),
  });
};
