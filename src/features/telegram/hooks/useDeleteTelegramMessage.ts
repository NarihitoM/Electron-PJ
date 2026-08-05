import { useMutation } from "@tanstack/react-query";
import { telegramauth } from "../api/api";

export const useDeleteTelegramMessage = () => {
  return useMutation({
    mutationFn: () => telegramauth.telegrammsgreset(),
  });
};
