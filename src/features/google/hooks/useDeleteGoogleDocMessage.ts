import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleauth } from "../api/api";

export const useDeleteGoogleDocMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => googleauth.deletedocsmsg(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs"] });
    },
  });
};
