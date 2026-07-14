import { useQuery } from "@tanstack/react-query";
import { n8nauth } from "../api/api";

export const useN8nMessages = (cursor?: string, limit?: number) => {
  return useQuery({
    queryKey: ["n8nmsg", cursor ?? "", limit ?? 10],
    queryFn: () => n8nauth.fetchn8nmsg(cursor, limit),
    staleTime: 0,
    retry: false,
  });
};
