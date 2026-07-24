import { useMutation, useQueryClient } from "@tanstack/react-query";
import { githubauth } from "../api/api";

export const useDisconnectGithub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => githubauth.githubdeleteservice(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github"] });
      queryClient.refetchQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
