import { useMutation } from "@tanstack/react-query";
import { userauthapi } from "../api/api";

export const useVerifyCode = () => {
  return useMutation({
    mutationFn: ({ stateid, code }: { stateid: string; code: string }) =>
      userauthapi.verifycode(stateid, code),
  });
};
