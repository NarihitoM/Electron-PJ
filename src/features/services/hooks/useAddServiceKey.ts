import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceauth } from "../api/api";
import type { authservicefeedback } from "../types/type";

export const useAddServiceKey = () => {
  const queryClient = useQueryClient();

  return useMutation<authservicefeedback, Error, { provider: string; key: string; host?: string }>({
    mutationFn: ({ provider, key, host }) => serviceauth.serviceadd(provider, key, host),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["key"] });
      queryClient.refetchQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
