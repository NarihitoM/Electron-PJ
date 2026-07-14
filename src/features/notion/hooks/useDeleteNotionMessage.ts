import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notionauth } from "../api/api";

export const useDeleteNotionMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notionauth.notiondeletemessage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notionmsg"] });
    },
  });
};
