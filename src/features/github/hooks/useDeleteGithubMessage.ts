import { useMutation, useQueryClient } from "@tanstack/react-query";
import { githubauth } from "../api/api";

export const useDeleteGithubMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => githubauth.githubdeletemessage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["githubmsg"] });
    },
  });
};
