import { useQuery } from "@tanstack/react-query";
import { discordauth } from "../api/api";

export const useDiscordMessages = (cursor?: string, limit?: number) => {
  return useQuery({
    queryKey: ["discordmsg", cursor ?? "", limit ?? 10],
    queryFn: async () => {
      const response = await discordauth.fetchdiscordmessage(cursor, limit);
      if (!response.success) throw new Error(response.message || "Failed to fetch messages");
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
