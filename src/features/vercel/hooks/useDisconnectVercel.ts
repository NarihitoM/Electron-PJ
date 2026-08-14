import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vercelauth } from "../api/api";

export const useDisconnectVercel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => vercelauth.verceldeleteservice(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vercel"] });
      queryClient.refetchQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
