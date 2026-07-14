import { useMutation, useQueryClient } from "@tanstack/react-query";
import { slackauth } from "../api/api";

export const useDeleteSlackMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => slackauth.deleteslackmsg(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slackmsg"] });
    },
  });
};
