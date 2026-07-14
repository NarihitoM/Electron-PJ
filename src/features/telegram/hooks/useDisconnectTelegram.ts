import { useMutation, useQueryClient } from "@tanstack/react-query";
import { telegramauth } from "../api/api";

export const useDisconnectTelegram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => telegramauth.telegramresetservice(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegram"] });
      queryClient.refetchQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
