import { useMutation, useQueryClient } from "@tanstack/react-query";
import { viberauth } from "../api/api";

export const useDisconnectViber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => viberauth.deleteviberservice(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viber"] });
      queryClient.refetchQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
