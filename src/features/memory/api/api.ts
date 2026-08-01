import { Server } from "../../../shared/config/axioconfig";
import {
  authmemorydata,
  authmemoryfeedback,
  authmemoryitem,
  authmemorystatus,
} from "../types/type";

export const memoryauth = {
  memoryfetch: async (page?: number, pageSize?: number): Promise<authmemorydata> => {
    const response = await Server.get("/memory/api/fetchmemory", {
      params: {
        ...(page !== undefined ? { page } : {}),
        ...(pageSize !== undefined ? { pageSize } : {}),
      },
    });
    return response.data;
  },
  memoryadd: async (content: string): Promise<authmemoryitem> => {
    const response = await Server.post("/memory/api/addmemory", { content });
    return response.data;
  },
  memoryupdate: async (id: string, content: string): Promise<authmemoryitem> => {
    const response = await Server.post("/memory/api/updatememory", { id, content });
    return response.data;
  },
  memorydelete: async (id: string): Promise<authmemoryfeedback> => {
    const response = await Server.post("/memory/api/deletememory", { id });
    return response.data;
  },
  memorystatus: async (): Promise<authmemorystatus> => {
    const response = await Server.get("/memory/api/status");
    return response.data;
  },
  memorytoggle: async (enabled: boolean): Promise<authmemorystatus> => {
    const response = await Server.post("/memory/api/togglememory", { enabled });
    return response.data;
  },
  memorysimilarity: async (): Promise<{
    success: boolean;
    data?: { id: string; relatedIds: string[] }[];
  }> => {
    const response = await Server.get("/memory/api/similarity");
    return response.data;
  },
};
