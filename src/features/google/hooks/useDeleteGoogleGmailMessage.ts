import { useMutation } from "@tanstack/react-query";
import { googleauth } from "../api/api";

export const useDeleteGoogleGmailMessage = () => {
  return useMutation({
    mutationFn: () => googleauth.deletegooglegmailmsg(),
  });
};
