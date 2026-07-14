import { useQuery } from "@tanstack/react-query";
import { notionauth } from "../api/api";
import type { notiondata } from "../types/type";

export const useNotionAccount = () => {
  return useQuery<notiondata | null>({
    queryKey: ["notion"],
    queryFn: async () => {
      const response = await notionauth.fetchnotionacc();
      if (!response.success) return null;
      return response.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
