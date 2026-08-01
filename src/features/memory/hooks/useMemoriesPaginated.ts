import { useInfiniteQuery } from "@tanstack/react-query";
import { memoryauth } from "../api/api";

const PAGE_SIZE = 20;

export const useMemoriesPaginated = () => {
  return useInfiniteQuery({
    queryKey: ["memory", "paginated"],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const response = await memoryauth.memoryfetch(pageParam, PAGE_SIZE);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch memories");
      }
      return response.data ?? { memories: [], nextCursor: null, hasMore: false };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
    refetchOnMount: "always",
  });
};
