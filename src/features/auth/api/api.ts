import { Server } from "../../../shared/config/axioconfig";
import { authdata, authfeedback } from "../types/type";

export const userauthapi = {
  login: async (useremail: string, userpassword: string): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/login", {
      useremail,
      userpassword,
    });
    return response.data;
  },
  googlelogin: async (token: string): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/googlelogin", {
      token,
    });
    return response.data;
  },
  signup: async (
    username: string,
    useremail: string,
    userpassword: string,
    userconfirmpassword: string,
  ): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/signup", {
      username,
      useremail,
      userpassword,
      userconfirmpassword,
    });
    return response.data;
  },
  fetchuser: async (): Promise<authdata> => {
    const response = await Server.get("/auth/api/fetchuser");
    return response.data;
  },
  verifycode: async (stateid: string, code: string): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/verifycode", {
      stateid,
      code,
    });
    return response.data;
  },
  resendcode: async (stateid: string): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/resend", {
      stateid,
    });
    return response.data;
  },
  clearcode: async (stateid: string): Promise<void> => {
    await Server.post("/auth/api/cleartemp", {
      stateid,
    });
  },
  changepasswordreset: async (useremail: string): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/changepasswordreset", {
      useremail,
    });
    return response.data;
  },
  changepasswordverify: async (stateid: string, code: string) => {
    const response = await Server.post("/auth/api/changepasswordverify", {
      stateid,
      code,
    });
    return response.data;
  },
  changepassword: async (stateid: string, userpassword: string) => {
    const response = await Server.post("/auth/api/changepassword", {
      stateid,
      userpassword,
    });
    return response.data;
  },
  changepasswordresend: async (stateid: string) => {
    const response = await Server.post("/auth/api/changepasswordresend", {
      stateid,
    });
    return response.data;
  },
  clearpasswordchange: async (stateid: string) => {
    const response = await Server.post("/auth/api/cleartempemail", {
      stateid,
    });
    return response.data;
  },
  undodelete: async (): Promise<authfeedback> => {
    const response = await Server.post("/auth/api/undodelete");
    return response.data;
  },
};
