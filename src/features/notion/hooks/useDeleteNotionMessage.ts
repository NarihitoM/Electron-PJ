import { useMutation } from "@tanstack/react-query";
import { notionauth } from "../api/api";

export const useDeleteNotionMessage = () => {
  return useMutation({
    mutationFn: () => notionauth.notiondeletemessage(),
  });
};
