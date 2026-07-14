import { useMutation } from "@tanstack/react-query";
import { n8nauth } from "../api/api";

export const useTestN8n = () => {
  return useMutation({
    mutationFn: ({
      n8nUrl,
      authType,
      authValue,
    }: {
      n8nUrl: string;
      authType: string;
      authValue?: string;
    }) => n8nauth.testConnection(n8nUrl, authType, authValue),
  });
};
