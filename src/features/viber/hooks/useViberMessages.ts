import { useQuery } from "@tanstack/react-query";
import { viberauth } from "../api/api";

export const useViberMessages = (cursor?: string, limit?: number) => {
  return useQuery({
    queryKey: ["vibermsg", cursor ?? "", limit ?? 10],
    queryFn: async () => {
      const response = await viberauth.fetchvibermessage(cursor, limit);
      if (!response.success) throw new Error(response.message || "Failed to fetch messages");
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
