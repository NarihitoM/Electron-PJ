import { Server } from "../../../shared/config/axioconfig";
import { authservicedata, authservicefeedback } from "../types/type";

export const serviceauth = {
  serviceadd: async (
    provider: string,
    key?: string,
    host?: string | null,
  ): Promise<authservicefeedback> => {
    const response = await Server.post("/service/api/addservice", {
      provider,
      key: key ?? "",
      ...(host !== undefined ? { host } : {}),
    });
    return response.data;
  },
  servicefetch: async (): Promise<authservicedata> => {
    const response = await Server.get("/service/api/fetchservice");
    return response.data;
  },
  servicedelete: async (id: number): Promise<authservicefeedback> => {
    const response = await Server.post("/service/api/deleteservice", {
      id,
    });
    return response.data;
  },
};
