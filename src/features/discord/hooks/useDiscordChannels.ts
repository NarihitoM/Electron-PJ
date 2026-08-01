import { useQuery } from "@tanstack/react-query";
import { discordauth } from "../api/api";

export const useDiscordChannels = (enabled: boolean) => {
  return useQuery({
    queryKey: ["discord-channels"],
    queryFn: async () => {
      const response = await discordauth.discordchannels();
      if (!response.success) return [];
      return response.data ?? [];
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
