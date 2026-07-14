import { useMutation } from "@tanstack/react-query";
import { userauthapi } from "../api/api";

export const useSendEmail = () => {
  return useMutation({
    mutationFn: (email: string) => userauthapi.changepasswordreset(email),
  });
};
