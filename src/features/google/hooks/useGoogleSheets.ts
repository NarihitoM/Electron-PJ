import { useQuery } from "@tanstack/react-query";
import { googleauth } from "../api/api";

export const useGoogleSheets = () => {
  return useQuery({
    queryKey: ["sheet"],
    queryFn: async () => {
      const response = await googleauth.fetchsheetmessage();
      if (!response.success) throw new Error(response.message || "Failed to fetch sheets");
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  });
};
