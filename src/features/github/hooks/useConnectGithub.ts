import { useMutation, useQueryClient } from "@tanstack/react-query";
import { githubauth } from "../api/api";

export const useConnectGithub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => githubauth.githubstate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github"] });
    },
  });
};
