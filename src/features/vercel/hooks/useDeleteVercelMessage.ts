import { useMutation } from "@tanstack/react-query";
import { vercelauth } from "../api/api";

export const useDeleteVercelMessage = () => {
  return useMutation({
    mutationFn: () => vercelauth.verceldeletemessage(),
  });
};
