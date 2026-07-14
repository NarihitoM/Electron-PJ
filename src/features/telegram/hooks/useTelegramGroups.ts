import { useQuery } from "@tanstack/react-query";
import { telegramauth } from "../api/api";

export const useTelegramGroups = () => {
  return useQuery({
    queryKey: ["telegrammsg"],
    queryFn: async () => {
      const response = await telegramauth.fetchtelegramaccount();
      if (!response.success) throw new Error(response.message || "Failed to fetch groups");
      const data = response.data as any;
      return data?.groups ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
