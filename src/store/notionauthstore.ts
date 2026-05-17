import { notionauth } from "@/api/notionauth";
import { datafetch } from "@/config/tanstackqueryconfig";
import { createnotion } from "@/types/notiontype";
import { toast } from "sonner";
import { create } from "zustand";


export const notionauthstore = create<createnotion>((set) => ({
    loadingnotion: false,
    loadingnotiondelete: false,
    loadingnotionmsg: false,
    hasfetch: false,
    workspacename: "",
    pages: [],

    provider: "",
    model: "",
   setProvider: (provider: string) =>
        set({ provider, model: "" }),

    setModel: (model: string) =>
        set({ model }),
    resetnotion: () => {
        set({
            workspacename: null,
            pages: [],
            provider: "",
            model: "",
            loadingnotion: false,
            loadingnotiondelete: false,
            loadingnotionmsg: false,
            hasfetch: false,
        })
    },

    fetchnotionacc: async () => {
        const executeFetch = async () => {
            try {
                set({ loadingnotion: true });
                const result = await datafetch.fetchQuery({
                    queryKey: ['notion'],
                    queryFn: () => notionauth.fetchnotionacc(),
                    staleTime: 0
                });

                set({
                    workspacename: result.data?.workspacename,
                    pages: result.data?.pages ?? []
                });
            }
            catch (err: unknown) {
                set({
                    workspacename: "",
                    pages: []
                });

                if (err instanceof Error) {
                    const errorObj = err as any;
                    const errorMessage = errorObj.response?.data?.message || err.message;

                    toast.error(errorMessage, {
                        id: "notion-error",
                        description: "Failed to connect to Notion workspace.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("notion-error");
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
                set({ loadingnotion: false });
            }
        };

        await executeFetch();
    },
    fetchnotionmsg: async () => {
        try {
            const result = await datafetch.fetchQuery({
                queryKey: ['notionmsg'],
                queryFn: async () => {
                    const response = await notionauth.fetchnotionmsg();
                    return response;
                },
                staleTime: 0
            })
            return result;
        }
        catch (err: unknown) {
            throw err;
        }
    },
    sendmessage: async (
        content: string,
        provider: string,
        model: string,
        id: string,
        name: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string; error : string }) => void
    ) => {
        try {
            await notionauth.sendmessage(
                content,
                provider,
                model,
                id,
                name,
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
    deletenotionservice: async () => {
        try {
            set({ loadingnotiondelete: true });
            const response = await notionauth.notiondeleteservice();
            datafetch.removeQueries({ queryKey: ["notion"] });

            set({
                workspacename: null,
                pages: []
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
            set({ loadingnotiondelete: false });
        }
    },
    deletenotionmessage: async () => {
        try {
            set({ loadingnotionmsg: true })
            const response = await notionauth.notiondeletemessage();
            datafetch.removeQueries({ queryKey: ["notionmsg"] });


            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingnotionmsg: false })
        }
    }
}))