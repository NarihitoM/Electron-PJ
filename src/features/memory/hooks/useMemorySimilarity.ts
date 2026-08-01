import { useQuery } from "@tanstack/react-query";
import { memoryauth } from "../api/api";

export const useMemorySimilarity = (enabled: boolean) => {
  return useQuery({
    queryKey: ["memory-similarity"],
    queryFn: async () => {
      const response = await memoryauth.memorysimilarity();
      if (!response.success) return [];
      return response.data ?? [];
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
