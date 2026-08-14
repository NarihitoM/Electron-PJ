import { useQuery } from "@tanstack/react-query";
import { vercelauth } from "../api/api";
import type { vercelaccountdata } from "../types/type";

export const useVercelAccount = () => {
  return useQuery<vercelaccountdata | null>({
    queryKey: ["vercel"],
    queryFn: async () => {
      const response = await vercelauth.getConfig();
      return response.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
