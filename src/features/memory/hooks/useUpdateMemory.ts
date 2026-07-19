import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memoryauth } from "../api/api";
import type { authmemoryitem } from "../types/type";

export const useUpdateMemory = () => {
  const queryClient = useQueryClient();

  return useMutation<authmemoryitem, Error, { id: string; content: string }>({
    mutationFn: ({ id, content }) => memoryauth.memoryupdate(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    },
  });
};
