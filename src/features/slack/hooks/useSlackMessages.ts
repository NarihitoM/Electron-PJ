import { useQuery } from "@tanstack/react-query";
import { slackauth } from "../api/api";

export const useSlackMessages = (cursor?: string, limit?: number) => {
  return useQuery({
    queryKey: ["slackmsg", cursor ?? "", limit ?? 10],
    queryFn: async () => {
      const response = await slackauth.fetchslackmessage(cursor, limit);
      if (!response.success) throw new Error(response.message || "Failed to fetch messages");
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
