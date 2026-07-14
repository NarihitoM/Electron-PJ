import { Server } from "../../../shared/config/axioconfig";

export interface EmailCredentialData {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
}

interface CredentialResponse {
  success: boolean;
  exists?: boolean;
  data?: EmailCredentialData | null;
  message?: string;
}

export const emailcredapi = {
  save: async (creds: EmailCredentialData): Promise<CredentialResponse> => {
    const response = await Server.post("/email/api/credential", creds);
    return response.data;
  },
  fetch: async (): Promise<CredentialResponse> => {
    const response = await Server.get("/email/api/credential");
    return response.data;
  },
  delete: async (): Promise<CredentialResponse> => {
    const response = await Server.delete("/email/api/credential");
    return response.data;
  },
};
