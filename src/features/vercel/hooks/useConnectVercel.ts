import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vercelauth } from "../api/api";

export const useConnectVercel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => vercelauth.vercelstate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vercel"] });
    },
  });
};
