import { serviceauth } from "@/api/serviceauth";
import { datafetch } from "@/config/tanstackqueryconfig";
import { createservice } from "@/types/servicetype";
import { toast } from "sonner";
import { create } from "zustand";

export const authservicestore = create<createservice>((set) => ({
    //loading
    loading: false,
    loadingfetch: false,
    loadingdelete: false,
    hasfetch: false,

    setHasFetch: () => set((state) => ({ hasfetch: !state.hasfetch })),

    //Data
    Api: [],

    //Functions
    resetservice: () => {
        set({
            Api: [], loading: false,
            loadingfetch: false,
            hasfetch: false,
        })
    },
    addservicekey: async (
        provider: string,
        key: string
    ) => {
        try {
            set({ loading: true })
            const response = await serviceauth.serviceadd(
                provider,
                key
            );
            if (response.success) {
                set((state) => ({ hasfetch: !state.hasfetch }));
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
    fetchservicekey: async () => {
        const executeFetch = async () => {
            try {
                set({ loadingfetch: true });
                const result = await datafetch.fetchQuery({
                    queryKey: ["key"],
                    queryFn: () => serviceauth.servicefetch(),
                    staleTime: 0
                });

                set({
                    Api: result.data ?? []
                });
            }
            catch (err: unknown) {
                set({ Api: [] });

                if (err instanceof Error) {
                    const errorObj = err as any;
                    const errorMessage = errorObj.response?.data?.message || err.message;

                    toast.error(errorMessage, {
                        id: "service-error",
                        description: "Unable to retrieve API keys.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("service-error");
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
    deleteservicekey: async (
        id: number
    ) => {
        try {
            set({ loadingdelete: true });
            const response = await serviceauth.servicedelete(
                id
            );
            datafetch.removeQueries({ queryKey: ["key"] })

            return response;
        }
        catch (err: unknown) {
            throw err;
        }
        finally {
            set({ loadingdelete: false });
            set((state) => ({ hasfetch: !state.hasfetch }));
        }
    }
}))