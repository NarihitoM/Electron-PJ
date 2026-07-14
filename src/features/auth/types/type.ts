//User interface
export interface User {
  username: string;
  useremail: string;
  authtype: string;
  profileurl: string;
  credits?: number;
  creditsUpdatedAt?: string;
}

//Apiresponse
export interface Apiresponse<T = void> {
  success: boolean;
  message: string;
  stateid: string;
  token?: string;
  data?: T;
}

//Type
export type authfeedback = Apiresponse<User>;
export type authdata = Apiresponse<User>;

export interface createuserauth {
  //loading
  loading: boolean;
  loadinggoogle: boolean;
  loadinginitial: boolean;
  loadingverify: boolean;
  loadingresend: boolean;
  loadingupdate: boolean;
  loadingpassword: boolean;
  loadingpasswordverify: boolean;
  loadingpasswordresend: boolean;
  loadingpasswordchange: boolean;
  loadingpasswordchangereset: boolean;
  loadingpasswordchangeverify: boolean;
  loadingpasswordchangeresend: boolean;

  //Data
  userdata: User | null;
  stateid: string;

  //function
  resetuser: () => void;
  signup: (
    username: string,
    useremail: string,
    userpassword: string,
    userconfirmpassword: string,
  ) => Promise<authfeedback>;
  login: (useremail: string, userpassword: string) => Promise<authfeedback>;
  googlelogin: (token: string) => Promise<authfeedback>;
  verifycode: (stateid: string, code: string) => Promise<authfeedback>;
  resendcode: (stateid: string) => Promise<authfeedback>;
  passwordreset: (currentpassword: string, newpassword: string) => Promise<authfeedback>;
  passwordverify: (stateid: string, code: string) => Promise<authfeedback>;
  passwordresend: (stateid: string) => Promise<authfeedback>;
  changepasswordreset: (useremail: string) => Promise<authfeedback>;
  changepasswordverify: (stateid: string, code: string) => Promise<authfeedback>;
  changepassword: (stateid: string, password: string) => Promise<authfeedback>;
  changepasswordresend: (stateid: string) => Promise<authfeedback>;
  clearchangepassword: (stateid: string) => Promise<void>;
  clearpasscode: (stateid: string) => Promise<void>;
  clearcode: (stateid: string) => Promise<void>;
  userfetch: () => Promise<void>;
  userlogout: () => Promise<void>;
  userupdate: (formdata: FormData) => Promise<authfeedback>;
}

export interface AuthClientState {
  email: string;
  setEmail: (email: string) => void;
  resetemail: () => void;
}
