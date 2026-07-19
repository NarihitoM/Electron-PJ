import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memoryauth } from "../api/api";
import type { authmemorystatus } from "../types/type";

export const useToggleMemory = () => {
  const queryClient = useQueryClient();

  return useMutation<authmemorystatus, Error, boolean>({
    mutationFn: (enabled) => memoryauth.memorytoggle(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory-status"] });
    },
  });
};
