import { useQuery } from "@tanstack/react-query";
import { githubauth } from "../api/api";
import type { githubdata } from "../types/type";

export const useGithubAccount = () => {
  return useQuery<githubdata | null>({
    queryKey: ["github"],
    queryFn: async () => {
      const response = await githubauth.fetchgithubacc();
      if (!response.success) return null;
      return response.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
