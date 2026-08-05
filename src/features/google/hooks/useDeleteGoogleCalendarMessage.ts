import { useMutation } from "@tanstack/react-query";
import { googleauth } from "../api/api";

export const useDeleteGoogleCalendarMessage = () => {
  return useMutation({
    mutationFn: () => googleauth.deletecalendarmsg(),
  });
};
