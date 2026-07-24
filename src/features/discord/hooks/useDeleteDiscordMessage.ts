import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discordauth } from "../api/api";

export const useDeleteDiscordMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => discordauth.deletediscordmsg(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discordmsg"] });
    },
  });
};
