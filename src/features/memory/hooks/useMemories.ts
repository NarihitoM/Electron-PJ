import { useQuery } from "@tanstack/react-query";
import { memoryauth } from "../api/api";
import type { Memoryitem } from "../types/type";

export const useMemories = () => {
  return useQuery<Memoryitem[]>({
    queryKey: ["memory"],
    queryFn: async () => {
      const response = await memoryauth.memoryfetch();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch memories");
      }
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
