import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discordauth } from "../api/api";

export const useDisconnectDiscord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => discordauth.deletediscordservice(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discord"] });
      queryClient.refetchQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
