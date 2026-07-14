import { Server } from "../../../shared/config/axioconfig";
import { authfeedback } from "../../auth/types/type";

export const accountauth = {
  passwordreset: async (currentpassword: string, newpassword: string): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/passwordreset", {
      currentpassword,
      newpassword,
    });
    return response.data;
  },
  passwordverify: async (stateid: string, code: string): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/passwordverify", {
      stateid,
      code,
    });
    return response.data;
  },
  passwordresend: async (stateid: string): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/passwordresend", {
      stateid,
    });
    return response.data;
  },
  clearpasswordcode: async (stateid: string): Promise<void> => {
    await Server.post("/auth/api/clearpass", {
      stateid,
    });
  },
  userupdate: async (formdata: FormData): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/update", formdata);
    return response.data;
  },
  deleteaccount: async (): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/deleteaccount");
    return response.data;
  },
  logout: async (): Promise<void> => {
    if ((window as any).api) {
      await (window as any).api.logout();
    }
  },
};
