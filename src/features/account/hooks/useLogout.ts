import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountauth } from "../api/api";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => accountauth.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
