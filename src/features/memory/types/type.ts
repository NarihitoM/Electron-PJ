export interface Memoryitem {
  id: string;
  content: string;
  source: "manual" | "auto";
  createdAt: string;
  updatedAt: string;
}

export interface Apiresponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export type authmemoryfeedback = Apiresponse;
export type authmemorydata = Apiresponse<Memoryitem[]>;
export type authmemoryitem = Apiresponse<Memoryitem>;
export type authmemorystatus = Apiresponse<{ enabled: boolean }>;
