import { useMutation } from "@tanstack/react-query";
import { googleauth } from "../api/api";

export const useDeleteGoogleDocMessage = () => {
  return useMutation({
    mutationFn: () => googleauth.deletedocsmsg(),
  });
};
