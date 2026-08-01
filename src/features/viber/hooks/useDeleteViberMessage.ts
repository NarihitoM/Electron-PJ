import { useMutation, useQueryClient } from "@tanstack/react-query";
import { viberauth } from "../api/api";

export const useDeleteViberMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => viberauth.deletevibermsg(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vibermsg"] });
    },
  });
};
