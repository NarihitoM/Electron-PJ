import { useMutation } from "@tanstack/react-query";
import { n8nauth } from "../api/api";

export const useDeleteN8nMessage = () => {
  return useMutation({
    mutationFn: () => n8nauth.n8ndeletemessage(),
  });
};
