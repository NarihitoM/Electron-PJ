import { googleauth } from "@/api/googleauth";
import { datafetch } from "@/config/tanstackqueryconfig";
import { creategoogle } from "@/types/googletype";
import { toast } from "sonner";
import { create } from "zustand";

export const googleauthstore = create<creategoogle>((set) => ({
    loading: false,
    loadingfetch: false,
    loadingdocs: false,
    loadingsheet: false,
    hasfetch: false,
    loadinggoogleservicedelete: false,
    loadingdocsdelete: false,
    loadingsheetdelete: false,

    provider: "",
    model: "",
    sheeturl: "",
    docsurl: "",
    sheet: [],
    docs: [],
    serviceemail: null,

    setsheeturl: (url: string) => set({ sheeturl: url }),
    setdocsurl: (url: string) => set({ docsurl: url }),
    setProvider: (provider: string) =>
        set({ provider, model: "" }),

    setModel: (model: string) =>
        set({ model }),
    
    resetgoogle: () => {
        set({
            serviceemail: null,
            provider: "",
            model: "",
            sheeturl: "",
            sheet: [],
            docs: [],
            loading: false,
            loadingfetch: false,
            loadingdocs: false,
            loadingsheet: false,
            hasfetch: false,
            loadinggoogleservicedelete: false,
            loadingdocsdelete: false,
            loadingsheetdelete: false,
        })
    },
    addgoogleservice: async (
        serviceemail: string,
        servicekey: string,
    ) => {
        try {
            set({ loading: true })
            const response = await googleauth.addservice(
                serviceemail,
                servicekey
            )
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loading: false })
        }
    },
    addgooglesheet: async (
        sheeturl: string
    ) => {
        try {
            set({ loadingsheet: true })
            const response = await googleauth.addgooglesheeturl(
                sheeturl
            )
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingsheet: false })
        }
    },
    addgoogledocs: async (
        docsurl: string
    ) => {
        try {
            set({ loadingdocs: true })
            const response = await googleauth.addgoogledocsurl(
                docsurl
            )
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingdocs: false })
        }
    },
    fetchgoogleservice: async () => {
        const executeFetch = async () => {
            try {
                set({ loadingfetch: true });
                const result = await datafetch.fetchQuery({
                    queryKey: ["google"],
                    queryFn: () => googleauth.fetchgoogleservice(),
                    staleTime: 0
                });

                set({
                    serviceemail: result.data?.serviceemail ?? null,
                    sheet: result.data?.googlesheet ?? [],
                    docs: result.data?.googledocs ?? []
                });
            }
            catch (err: unknown) {
                set({
                    provider: "",
                    model: "",
                    sheeturl: "",
                    sheet: [],
                    docs: [],
                    serviceemail: null,
                });

                if (err instanceof Error) {
                    const errorObj = err as any;
                    const errorMessage = errorObj.response?.data?.message || err.message;

                    toast.error(errorMessage, {
                        id: "google-error",
                        description: "Failed to connect to Google Services.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("google-error");
                                executeFetch();
                            },
                        },
                    });
                } else {
                    toast.error("An unexpected error occurred.");
                }

                throw err;
            }
            finally {
                set({ loadingfetch: false });
            }
        };

        await executeFetch();
    },
    deletegoogleservice: async () => {
        try {
            set({ loadinggoogleservicedelete: true })
            const response = await googleauth.deleteservice();
            datafetch.removeQueries({ queryKey: ['google'] });
            set({
                sheet: [],
                docs: [],
                serviceemail: null,
            })

             if (response.success) {
                set((state) => ({ hasfetch: !state.hasfetch }));
            }
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadinggoogleservicedelete: false })
        }
    },
    deletesheetmsg: async () => {
        try {
            set({ loadingsheetdelete: true })
            const response = await googleauth.deletesheetmsg();
            datafetch.removeQueries({ queryKey: ["sheet"] });

            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingsheetdelete: false })
        }
    },
    deletedocsmsg: async () => {
        try {
            set({ loadingdocsdelete: true })
            const response = await googleauth.deletedocsmsg();
            datafetch.removeQueries({ queryKey: ["docs"] });

            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingdocsdelete: false })
        }
    },
    fetchsheetmessage: async () => {
        try {
            const result = await datafetch.fetchQuery({
                queryKey: ["sheet"],
                queryFn: async () => {
                    const response = await googleauth.fetchsheetmessage();
                    return response;
                },
                staleTime: 0
            });
            return result;
        }
        catch (err: unknown) {
            console.log(err);
            throw err;
        }
    },
    fetchdocsmessage: async () => {
        try {
            const result = await datafetch.fetchQuery({
                queryKey: ["docs"],
                queryFn: async () => {
                    const response = await googleauth.fetchdocsmessage();
                    return response;
                },
                staleTime: 0
            });
            return result;
        }
        catch (err: unknown) {
            console.log(err);
            throw err;
        }
    },
    sendsheetmessage: async (
        content: string,
        provider: string,
        model: string,
        url: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string ; error : string }) => void
    ) => {
        try {
            await googleauth.sendsheetmessage(
                content,
                provider,
                model,
                url,
                type,
                (chunk) => {
                    onChunk(chunk);
                },
                (status) => {
                    if (onStatus) onStatus(status);
                }
            );
        }
        catch (err: unknown) {
            throw err;
        }
    },
    senddocsmessage: async (
        content: string,
        provider: string,
        model: string,
        url: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string; error : string }) => void
    ) => {
        try {
            await googleauth.senddocsmessage(
                content,
                provider,
                model,
                url,
                type,
                (chunk) => {
                    onChunk(chunk);
                },
                (status) => {
                    if (onStatus) onStatus(status);
                }
            );
        }
        catch (err: unknown) {
            throw err;
        }
    }
}))