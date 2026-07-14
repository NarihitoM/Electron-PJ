import { useQuery } from "@tanstack/react-query";
import { telegramauth } from "../api/api";

export const useTelegramMessages = (cursor?: string, limit?: number) => {
  return useQuery({
    queryKey: ["telegrammsg", cursor ?? "", limit ?? 10],
    queryFn: async () => {
      const response = await telegramauth.fetchtelegrammessage(cursor, limit);
      if (!response.success) throw new Error(response.message || "Failed to fetch messages");
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
