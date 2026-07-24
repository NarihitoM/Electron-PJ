import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discordauth } from "../api/api";

export const useConnectDiscord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => discordauth.discordstate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discord"] });
    },
  });
};
