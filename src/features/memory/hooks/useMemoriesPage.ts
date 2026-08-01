import { useQuery } from "@tanstack/react-query";
import { memoryauth } from "../api/api";
import type { MemoryPage } from "../types/type";

export const PAGE_SIZE = 10;

export const useMemoriesPage = (page: number) => {
  return useQuery<MemoryPage>({
    queryKey: ["memory", "page", page],
    queryFn: async () => {
      const response = await memoryauth.memoryfetch(page, PAGE_SIZE);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch memories");
      }
      return (
        response.data ?? { memories: [], page, pageSize: PAGE_SIZE, totalCount: 0, totalPages: 1 }
      );
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
    refetchOnMount: "always",
    placeholderData: (prev) => prev,
  });
};
