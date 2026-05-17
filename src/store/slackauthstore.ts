import { slackauth } from "@/api/slackauth";
import { datafetch } from "@/config/tanstackqueryconfig";
import { createslack } from "@/types/slacktype";
import { toast } from "sonner";
import { create } from "zustand";

export const useslackstore = create<createslack>((set) => ({
    //Data
    loadingslack: false,
    loadingslackmsg: false,
    loadingslackdelete: false,
    loadingslackdelmsg: false,
    hasfetch: false,
    workspace: null,
    public: [],
    private: [],
    im: [],
    mpim: [],
    provider: "",
    model: "",


    //functions
    setProvider: (provider: string) =>
        set({ provider, model: "" }),
    setModel: (model: string) =>
        set({ model }),

    resetslack: () => {
        set({
            workspace: null,
            public: [],
            private: [],
            im: [],
            mpim: [],
            loadingslack: false
        });
    },
    fetchslackacc: async () => {
        const executeFetch = async () => {
            try {
                set({ loadingslack: true });
                const result = await datafetch.fetchQuery({
                    queryKey: ['slack'],
                    queryFn: () => slackauth.slackacc(),
                    staleTime: 0
                });

                set({
                    workspace: result.data?.workspace,
                    public: result.data?.public ?? [],
                    private: result.data?.private ?? [],
                    im: result.data?.im ?? [],
                    mpim: result.data?.mpim ?? []
                });
            }
            catch (err: unknown) {
                set({
                    workspace: null,
                    public: [],
                    private: [],
                    im: [],
                    mpim: [],
                });

                if (err instanceof Error) {
                    const errorObj = err as any;
                    const errorMessage = errorObj.response?.data?.message || err.message;

                    toast.error(errorMessage, {
                        id: "slack-error",
                        description: "Failed to connect to Slack workspace.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("slack-error");
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
                set({ loadingslack: false });
            }
        }
        await executeFetch();
    },
    deleteslackservice: async () => {
        try {
            set({ loadingslackdelete: true })
            const response = await slackauth.deleteslackservice();
            datafetch.removeQueries({ queryKey: ["slack"] });
            set({
                workspace: null,
                public: [],
                private: [],
                im: [],
                mpim: [],
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
            set({ loadingslackdelete: false })
        }
    },
    deleteslackmsg: async () => {
        try {
            set({ loadingslackdelmsg: true })
            const response = await slackauth.deleteslackmsg();
            datafetch.removeQueries({ queryKey: ["slackmsg"] });

            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingslackdelmsg: false })
        }
    },
    fetchslackmessage: async () => {
        try {
            const result = await datafetch.fetchQuery({
                queryKey: ['slackmsg'],
                queryFn: async () => {
                    const response = await slackauth.fetchslackmessage();
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
    sendslackmessage: async (
        content: string,
        provider: string,
        model: string,
        id: string,
        name: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string; error: string }) => void
    ) => {
        try {
            await slackauth.sendmessage(
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
    }
}))