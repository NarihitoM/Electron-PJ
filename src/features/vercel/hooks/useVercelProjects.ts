import { useQuery } from "@tanstack/react-query";
import { vercelauth } from "../api/api";
import type { vercelprojectdata } from "../types/type";

export const useVercelProjects = () => {
  return useQuery<vercelprojectdata[]>({
    queryKey: ["vercel-projects"],
    queryFn: async () => {
      const response = await vercelauth.getProjects();
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
