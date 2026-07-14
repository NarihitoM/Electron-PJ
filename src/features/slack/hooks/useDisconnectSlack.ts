import { useMutation, useQueryClient } from "@tanstack/react-query";
import { slackauth } from "../api/api";

export const useDisconnectSlack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => slackauth.deleteslackservice(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slack"] });
      queryClient.refetchQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
