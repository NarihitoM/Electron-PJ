import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emailcredapi, type EmailCredentialData } from "../api/api";

export const useSaveEmailCreds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (creds: EmailCredentialData) => emailcredapi.save(creds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-creds"] });
    },
  });
};
