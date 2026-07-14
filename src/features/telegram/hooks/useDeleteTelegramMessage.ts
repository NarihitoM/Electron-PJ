import { useMutation, useQueryClient } from "@tanstack/react-query";
import { telegramauth } from "../api/api";

export const useDeleteTelegramMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => telegramauth.telegrammsgreset(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegrammsg"] });
    },
  });
};
