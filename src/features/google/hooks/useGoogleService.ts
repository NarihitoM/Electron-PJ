import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { googleauth } from "../api/api";

export const useGoogleService = () => {
  return useQuery({
    queryKey: ["google"],
    queryFn: async () => {
      const response = await googleauth.fetchgoogleservice();
      if (!response.success) return null;
      if ((response.data as any)?.syncError) {
        toast.error(`Google sync failed: ${(response.data as any).syncError}`);
      }
      return response.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
