import { useQuery } from "@tanstack/react-query";
import { chatauth } from "../api/api";
import type { messagefetch } from "../types/type";

export const useMessages = (chatid: string | undefined, cursor?: number, limit?: number) => {
  return useQuery<messagefetch[]>({
    queryKey: ["message", chatid, cursor, limit],
    queryFn: async () => {
      if (!chatid) return [];
      const response = await chatauth.fetchchatmessage(chatid, cursor, limit);
      if (!response.success) throw new Error(response.message || "Failed to fetch messages");
      return response.data?.messages ?? [];
    },
    enabled: !!chatid,
    retry: false,
  });
};
