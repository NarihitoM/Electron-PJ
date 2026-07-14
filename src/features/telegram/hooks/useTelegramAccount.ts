import { useQuery } from "@tanstack/react-query";
import { telegramauth } from "../api/api";

export const useTelegramAccount = () => {
  return useQuery({
    queryKey: ["telegram"],
    queryFn: async () => {
      const response = await telegramauth.fetchtelegramaccount();
      if (!response.success) return null;
      return response.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
