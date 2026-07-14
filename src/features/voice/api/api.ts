import { Server } from "../../../shared/config/axioconfig";

export const voiceauth = {
  sendvoice: async (form: FormData): Promise<{ transcribe: string }> => {
    const response = await Server.post("/transcribe/api/voice", form);
    return response.data;
  },
};
