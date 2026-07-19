import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memoryauth } from "../api/api";
import type { authmemoryitem } from "../types/type";

export const useAddMemory = () => {
  const queryClient = useQueryClient();

  return useMutation<authmemoryitem, Error, string>({
    mutationFn: (content) => memoryauth.memoryadd(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    },
  });
};
