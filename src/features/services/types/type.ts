export interface Servicefetch {
  id: number;
  provider: string;
  apiKey: string;
  host?: string;
}

//Apiresponse
export interface Apiresponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

//Type
export type authservicefeedback = Apiresponse;
export type authservicedata = Apiresponse<Servicefetch[]>;

export interface createservice {
  loading: boolean;
  loadingfetch: boolean;
  loadingdelete: boolean;

  Api: Servicefetch[];

  resetservice: () => void;
  addservicekey: (provider: string, key: string, host?: string) => Promise<authservicefeedback>;
  fetchservicekey: () => Promise<void>;
  deleteservicekey: (id: number) => Promise<authservicefeedback>;
}
