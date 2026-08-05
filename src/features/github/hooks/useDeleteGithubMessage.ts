import { useMutation } from "@tanstack/react-query";
import { githubauth } from "../api/api";

export const useDeleteGithubMessage = () => {
  return useMutation({
    mutationFn: () => githubauth.githubdeletemessage(),
  });
};
