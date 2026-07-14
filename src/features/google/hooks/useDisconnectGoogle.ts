import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleauth } from "../api/api";

export const useDisconnectGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => googleauth.deleteservice(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google"] });
      queryClient.refetchQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
