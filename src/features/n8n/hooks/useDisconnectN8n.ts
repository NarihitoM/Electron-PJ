import { useMutation, useQueryClient } from "@tanstack/react-query";
import { n8nauth } from "../api/api";

export const useDisconnectN8n = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => n8nauth.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["n8nconfig"] });
    },
  });
};
