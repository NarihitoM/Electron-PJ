import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleauth } from "../api/api";

export const useDeleteGoogleSheetMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => googleauth.deletesheetmsg(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sheet"] });
    },
  });
};
