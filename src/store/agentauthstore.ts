import { agentauth } from "@/api/agentauth";
import { datafetch } from "@/config/tanstackqueryconfig";
import { createAgent } from "@/types/agenttype"
import { toast } from "sonner"
import { create } from "zustand"

export const useagentstore = create<createAgent>((set) => ({

    //loading
    loadingfetch: false,
    loadingnode: false,

    //data
    Node: [],
    type: "",
    settype: (type: string) => set({ type }),

    resetagent: () => {
        set({
            Node: [],
            type: "",
            loadingfetch: false,
            loadingnode: false
        })
    },

    //functions
    addnode: async (
        name: string,
        provider: string,
        actor: string,
        model: string,
        tool: string,
        prompt: string
    ) => {
        try {
            set({ loadingnode: true });
            const response = await agentauth.addnode(
                name,
                provider,
                actor,
                model,
                tool,
                prompt
            )
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingnode: false })
        }
    },
    fetchnode: async () => {
        const executeFetch = async () => {
            try {
                set({ loadingfetch: true });
                const result = await datafetch.fetchQuery({
                    queryKey: ["node"],
                    queryFn: () => agentauth.fetchnode(),
                    staleTime: 0,
                });

                set({ Node: result.data ?? [] });
            } catch (err: unknown) {
                set({ Node: [] });
                if (err instanceof Error) {
                    const Error = err as any;
                    const error = Error.response?.data?.message || err.message;
                    toast.error(error, {
                        id: "nodefetch",
                        description: "There was a problem connecting to the server.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("nodefetch");
                                executeFetch()
                            },
                        },
                    });
                } else {
                    toast.error("An unexpected error occurred.")
                }
                throw err;
            } finally {
                set({ loadingfetch: false });
            }
        };

        await executeFetch();
    },
    updatenode: async (
        nodeid: string,
        name: string,
        provider: string,
        actor: string,
        model: string,
        tool: string,
        prompt: string
    ) => {
        try {
            set({ loadingnode: true });
            const response = await agentauth.updatenode(
                nodeid,
                name,
                provider,
                actor,
                model,
                tool,
                prompt
            )
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingnode: false })
        }
    },
    deletenode: async (
        nodeid: string
    ) => {
        try {
            set({ loadingnode: true });
            const response = await agentauth.deletenode(
                nodeid,
            )
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingnode: false })
        }
    },
    fetchagentmessages: async () => {
        try {
            const result = await datafetch.fetchQuery({
                queryKey: ["agentmessages"],
                queryFn: async () => {
                    const response = await agentauth.fetchagentmessages();
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
    storeagentmessage: async (
        role: string,
        content: string,
        name?: string
    ) => {
        try {
            const response = await agentauth.storeagentmessage(
                role,
                content,
                name
            );
            return response;
        }
        catch (err: unknown) {
            throw err;
        }
    }
}))