import { useMutation } from "@tanstack/react-query";
import { slackauth } from "../api/api";

export const useDeleteSlackMessage = () => {
  return useMutation({
    mutationFn: () => slackauth.deleteslackmsg(),
  });
};
