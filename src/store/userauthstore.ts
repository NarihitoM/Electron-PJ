import { userauthapi } from "@/api/userauth";
import { datafetch } from "@/config/tanstackqueryconfig";
import { createuserauth } from "@/types/userauthtype";
import { toast } from "sonner";
import { create } from "zustand";

export const userauthstore = create<createuserauth>((set) => ({
    //loading
    loading: false,
    loadinginitial: false,
    loadingverify: false,
    loadingresend: false,
    loadingupdate: false,
    loadingpassword: false,
    loadingpasswordverify: false,
    loadingpasswordresend: false,
    loadingpasswordchange: false,
    loadingpasswordchangereset: false,
    loadingpasswordchangeverify: false,
    loadingpasswordchangeresend: false,

    //Data
    userdata: null,
    stateid: "",


    //functions

    resetuser: () => {
        set({
            userdata: null, loading: false,
            loadinginitial: false,
            loadingverify: false,
            loadingresend: false,
            loadingupdate: false,
            loadingpassword: false,
            loadingpasswordverify: false,
            loadingpasswordresend: false,
        })
    },
    signup: async (
        username: string,
        useremail: string,
        userpassword: string,
        userconfirmpassword: string
    ) => {
        try {
            set({ loading: true });
            const response = await userauthapi.signup(
                username,
                useremail,
                userpassword,
                userconfirmpassword
            );
            set({ stateid: response.stateid })
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loading: false })
        }
    },
    resendcode: async (
        stateid: string
    ) => {
        try {
            set({ loadingresend: true });
            const response = await userauthapi.resendcode(
                stateid
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingresend: false })
        }
    },
    passwordreset: async (
        currentpassword: string,
        newpassword: string
    ) => {
        try {
            set({ loadingpassword: true })
            const response = await userauthapi.passwordreset(
                currentpassword,
                newpassword
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingpassword: false })
        }
    },
    passwordverify: async (
        stateid: string,
        code: string
    ) => {
        try {
            set({ loadingpasswordverify: true })
            const response = await userauthapi.passwordverify(
                stateid,
                code
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingpasswordverify: false })
        }
    },
    passwordresend: async (
        stateid: string
    ) => {
        try {
            set({ loadingpasswordresend: true });
            const response = await userauthapi.passwordresend(
                stateid
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingpasswordresend: false })
        }
    },
    login: async (
        useremail: string,
        userpassword: string
    ) => {
        try {
            set({ loading: true })
            const response = await userauthapi.login(
                useremail,
                userpassword
            )
            if (response.success && response.token) {
                await (window as any).api.savetoken(response.token)
            }
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loading: false })
        }
    },
    userfetch: async () => {
        const executeFetch = async () => {
            try {
                set({ loadinginitial: true });
                const data = await datafetch.fetchQuery({
                    queryKey: ["user"],
                    queryFn: () => userauthapi.fetchuser(),
                    staleTime: 0
                });

                set({ userdata: data.data ?? null });
            }
            catch (err: unknown) {
                set({ userdata: null });

                if (err instanceof Error) {
                    const errorObj = err as any;
                    const errorMessage = errorObj.response?.data?.message || err.message;

                    toast.error(errorMessage, {
                        id: "userdata-error",
                        description: "We couldn't load your profile. Please try again.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("userdata-error");
                                executeFetch();
                            },
                        },
                    });
                } else {
                    toast.error("An unexpected error occurred while fetching user data.");
                }

                throw err;
            }
            finally {
                set({ loadinginitial: false });
            }
        };

        await executeFetch();
    },
    verifycode: async (
        stateid: string,
        code: string
    ) => {
        try {
            set({ loadingverify: true })

            const response = await userauthapi.verifycode(
                stateid,
                code
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingverify: false })
        }
    },
    userlogout: async () => {
        try {
            if ((window as any).api) {
                await (window as any).api.logout();
            }
        }
        catch (err: unknown) {
            set({ userdata: null });
            throw err;
        }
        finally {
            set({ userdata: null });
        }
    },
    userupdate: async (
        formdata : FormData
    ) => {
        try {
            set({ loadingupdate: true })
            const response = await userauthapi.userupdate(
                formdata
            );
            set((state) => ({
                userdata: state.userdata
                    ? { ...state.userdata, ...response.data }
                    : null
            }));
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingupdate: false })
        }
    },
    changepasswordreset: async (
        useremail: string
    ) => {
        try {
            set({ loadingpasswordchangereset: true })
            const response = await userauthapi.changepasswordreset(
                useremail
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingpasswordchangereset: false })
        }
    },
    changepasswordverify: async (
        stateid: string,
        code: string
    ) => {
        try {
            set({ loadingpasswordchangeverify: true })
            const response = await userauthapi.changepasswordverify(
                stateid,
                code
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingpasswordchangeverify: false })
        }
    },
    changepassword: async (
        stateid: string,
        password: string
    ) => {
        try {
            set({ loadingpasswordchange: true })
            const response = await userauthapi.changepassword(
                stateid,
                password
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingpasswordchange: false })
        }
    },
    changepasswordresend: async (
        stateid: string,
    ) => {
        try {
            set({ loadingpasswordchangeresend: true })
            const response = await userauthapi.changepasswordresend(
                stateid
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingpasswordchangeresend: false })
        }
    },
    clearchangepassword: async (
       stateid : string
    ) => {
        try {
            const response = await userauthapi.clearpasswordchange(
                stateid
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
    },
    clearpasscode: async (
        stateid: string
    ) => {
        try {
            const response = await userauthapi.clearpasswordcode(
                stateid
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
    },
    clearcode: async (
        stateid: string
    ) => {
        try {
            const response = await userauthapi.clearcode(
                stateid
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
    }
}))
