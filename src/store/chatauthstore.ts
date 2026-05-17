import { chatauth } from "@/api/chatauth"
import { datafetch } from "@/config/tanstackqueryconfig"
import { createchat } from "@/types/chatype"
import { toast } from "sonner"
import { create } from "zustand"

export const chatauthstore = create<createchat>((set) => ({

    //Data
    Chat: [],
    loadingchat: false,

    provider: "",
    model: "",

    setProvider: (provider: string) =>
        set({ provider, model: "" }),

    setModel: (model: string) =>
        set({ model }),

    //Functions
    resetchat: () => {
        set({ Chat: [], provider: "", model: "" })
    },
    createchat: async () => {
        try {
            const response = await chatauth.createchat();
            return response;
        }
        catch (err: unknown) {
            throw err;
        }

    },
    fetchchat: async () => {
        const executeFetch = async () => {
            try {
                set({ loadingchat: true })
                const result = await datafetch.fetchQuery({
                    queryKey: ["chat"],
                    queryFn: () => chatauth.fetchchat(),
                    staleTime: 0
                });

                set({ Chat: result.data ?? [] });
            }
            catch (err: unknown) {
                set({ Chat: [] });

                // Using explicit IF as requested
                if (err instanceof Error) {
                    const errorObj = err as any;
                    const errorMessage = errorObj.response?.data?.message || err.message;

                    toast.error(errorMessage, {
                        id: "chat-error",
                        description: "There was a problem connecting to the server.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("chat-error");
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
                set({ loadingchat: false })

            }
        };

        await executeFetch();
    },
    deletechat: async (
        chatid: string
    ) => {
        try {
            const response = await chatauth.deletechat(
                chatid
            )
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
    },
    sendmessage: async (
        chatid: string,
        provider: string,
        model: string,
        content: string,
        type: string,
        onChunk: (chunk: string, title?: string) => void
    ) => {
        try {
            await chatauth.sendmessage(
                chatid, provider, model, content, type,
                (chunk, title) => {
                    if (title) {
                        set((state) => ({
                            Chat: state.Chat.map(c => c.id === chatid ? { ...c, title } : c)
                        }));
                    }
                    onChunk(chunk);
                }
            );
        }
        catch (err: unknown) {
            throw err;
        }
    },
    fetchmessage: async (
        chatid: string
    ) => {
        try {
            const result = await datafetch.fetchQuery({
                queryKey: ["message"],
                queryFn: async () => {
                    const response = await chatauth.fetchchatmessage(
                        chatid,
                    )
                    return response;
                },
                staleTime: 0
            })
            return result;
        }
        catch (err: unknown) {
            throw err;
        }
    }
}))