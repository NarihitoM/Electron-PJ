import { useQuery } from "@tanstack/react-query";
import { viberauth } from "../api/api";

export const useViberAccount = () => {
  return useQuery({
    queryKey: ["viber"],
    queryFn: async () => {
      const response = await viberauth.viberacc();
      if (!response.success) return null;
      return response.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
