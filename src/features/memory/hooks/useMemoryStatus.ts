import { useQuery } from "@tanstack/react-query";
import { memoryauth } from "../api/api";

export const useMemoryStatus = () => {
  return useQuery<boolean>({
    queryKey: ["memory-status"],
    queryFn: async () => {
      const response = await memoryauth.memorystatus();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch memory status");
      }
      return response.data?.enabled ?? true;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
