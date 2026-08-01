import { useQuery } from "@tanstack/react-query";
import { memoryauth } from "../api/api";
import type { Memoryitem } from "../types/type";

// Fetches everything in one page (capped), for consumers that need the full
// set at once (the 3D globe view, similarity graph) rather than paginated list UI.
const ALL_MEMORIES_PAGE_SIZE = 300;

export const useMemories = () => {
  return useQuery<Memoryitem[]>({
    queryKey: ["memory", "all"],
    queryFn: async () => {
      const response = await memoryauth.memoryfetch(1, ALL_MEMORIES_PAGE_SIZE);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch memories");
      }
      return response.data?.memories ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
    refetchOnMount: "always",
  });
};
