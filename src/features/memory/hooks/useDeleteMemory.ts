import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memoryauth } from "../api/api";
import type { authmemoryfeedback } from "../types/type";

export const useDeleteMemory = () => {
  const queryClient = useQueryClient();

  return useMutation<authmemoryfeedback, Error, string>({
    mutationFn: (id) => memoryauth.memorydelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    },
  });
};
