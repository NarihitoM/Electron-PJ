import { useMutation } from "@tanstack/react-query";
import { discordauth } from "../api/api";

export const useDeleteDiscordMessage = () => {
  return useMutation({
    mutationFn: () => discordauth.deletediscordmsg(),
  });
};
