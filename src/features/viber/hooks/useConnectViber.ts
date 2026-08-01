import { useMutation, useQueryClient } from "@tanstack/react-query";
import { viberauth } from "../api/api";

export const useConnectViber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => viberauth.viberconnectinfo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viber"] });
    },
  });
};
