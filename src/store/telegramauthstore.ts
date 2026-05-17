import { telegramauth } from "@/api/telegramauth";
import { datafetch } from "@/config/tanstackqueryconfig";
import { createTelegram } from "@/types/telegramtype";
import { toast } from "sonner";
import { create } from "zustand";

export const telegramauthstore = create<createTelegram>((set) => ({
    //boolean
    loading: false,
    loadingverify: false,
    loadingfetch: false,
    hasfetch: false,
    loadingdeleteservice: false,
    loadingdeletemsg: false,

    //data
    userdata: null,
    groups: [],
    contacts: [],

    provider: "",
    model: "",
    mode: "",
    selectedGroupId: "",
    selectedContactId: "",

    setmode: (mode: string) => set({ mode, selectedGroupId: "", selectedContactId: "" }),
    setSelectedGroupId: (selectedGroupId: string) => set({ selectedGroupId }),
    setSelectedContactId: (selectedContactId: string) => set({ selectedContactId }),

    setProvider: (provider: string) =>
        set({ provider, model: "" }),

    setModel: (model: string) =>
        set({ model }),


    resettelegram: () => {
        set({
            userdata: null,
            groups: [],
            contacts: [],
            loading: false,
            loadingverify: false,
            loadingfetch: false,
            hasfetch: false,
            loadingdeleteservice: false,
            loadingdeletemsg: false,
            provider: "",
            model: "",
            mode: "",
            selectedGroupId: "",
            selectedContactId: "",
        })
    },
    //functions
    sendmessage: async (
        content: string,
        provider: string,
        model: string,
        id: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string; error : string }) => void
    ) => {
        try {
            await telegramauth.sendmessage(
                content,
                provider,
                model,
                id,
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
    telegramcreate: async (
        phone: string,
        password: string
    ) => {
        try {
            set({ loading: true });
            const response = await telegramauth.telegramservicecreate(
                phone,
                password
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loading: false })
        }
    },
    telegramverify: async (
        phonecode: string,
    ) => {
        try {
            set({ loadingverify: true });
            const response = await telegramauth.telegramverify(
                phonecode,
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
    telegramfetchdata: async () => {
        const executeFetch = async () => {
            try {
                set({ loadingfetch: true });
                const result = await datafetch.fetchQuery({
                    queryKey: ['telegram'],
                    queryFn: () => telegramauth.fetchtelegramaccount(),
                    staleTime: 0
                });

                set({
                    userdata: result.data,
                    contacts: result.data?.contacts ?? [],
                    groups: result.data?.groups ?? []
                });
            }
            catch (err: unknown) {
                set({
                    userdata: null,
                    groups: [],
                    contacts: [],
                });

                if (err instanceof Error) {
                    const errorObj = err as any;
                    const errorMessage = errorObj.response?.data?.message || err.message;

                    toast.error(errorMessage, {
                        id : "telegram-error",
                        description: "Failed to connect to Telegram account.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("telegram-error");
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
    fetchtelegrammessage: async () => {
        try {
            const result = await datafetch.fetchQuery({
                queryKey: ["Telegrammsg"],
                queryFn: async () => {
                    const response = await telegramauth.fetchtelegrammessage();
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
    telegrammsgreset: async () => {
        try {
            set({ loadingdeletemsg: true })
            const response = await telegramauth.telegrammsgreset();
            datafetch.removeQueries({ queryKey: ['Telegrammsg'] });

            if (response.success) {
                set((state) => ({ hasfetch: !state.hasfetch }));
            }

            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingdeletemsg: false })
        }
    },
    telegramservicereset: async () => {
        try {
            set({ loadingdeleteservice: true })
            const response = await telegramauth.telegramresetservice();
            datafetch.removeQueries({ queryKey: ['telegram'] });

            set({
                userdata: null,
                groups: [],
                contacts: []
            })
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingdeleteservice: false })
            set((state) => ({ hasfetch: !state.hasfetch }));
        }
    }
}))