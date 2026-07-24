import { useQuery } from "@tanstack/react-query";
import { githubauth } from "../api/api";

export const useGithubMessages = (cursor?: string, limit?: number) => {
  return useQuery({
    queryKey: ["githubmsg", cursor ?? "", limit ?? 10],
    queryFn: () => githubauth.fetchgithubmsg(cursor, limit),
    staleTime: 0,
    retry: false,
  });
};
