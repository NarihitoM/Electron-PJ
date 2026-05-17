import { webscrapauth } from "@/api/webscrapauth";
import { datafetch } from "@/config/tanstackqueryconfig";
import { createwebscrap } from "@/types/webscraptype";
import { create } from "zustand";

export const webscrapstore = create<createwebscrap>((set) => ({

    loadingdelete: false,
    provider: "",
    model: "",

    setProvider: (provider: string) =>
        set({ provider, model: "" }),

    setModel: (model: string) =>
        set({ model }),

    resetweb: () => {
        set({ provider: "", model: "" })
    },
    sendmessage: async (
        provider: string,
        model: string,
        content: string,
        onChunk: (chunk: string) => void
    ) => {
        try {
            await webscrapauth.sendmessage(
                provider,
                model,
                content,
                onChunk
            );
        }
        catch (err: unknown) {
            throw err;
        }
    },
    fetchweb: async (
    ) => {
        try {
            const data = await datafetch.fetchQuery({
                queryKey: ["web"],
                queryFn: async () => {
                    const response = await webscrapauth.fetchweb()
                    return response;
                },
                staleTime: 0
            });

            return data;
        }
        catch (err: unknown) {
            throw err;
        }
    },
    deleteweb: async () => {
        try {
            set({ loadingdelete: true });
            const response = await webscrapauth.deleteweb();
            datafetch.removeQueries({ queryKey: ["web"] });

            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingdelete: false })
        }
    }
}));
