import { useQuery } from "@tanstack/react-query";
import { chatauth } from "../../chat/api/api";

export const useConnections = () => {
  return useQuery<Record<string, boolean>>({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await chatauth.getconnections();
      if (!response.success) throw new Error("Failed to fetch connections");
      return response.data ?? {};
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
