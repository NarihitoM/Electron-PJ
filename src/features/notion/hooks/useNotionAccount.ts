import { useQuery } from "@tanstack/react-query"
import { notionauth } from "../api/api"
import type { notiondata } from "../types"

export const useNotionAccount = () => {
    return useQuery<notiondata>({
        queryKey: ["notion"],
        queryFn: async () => {
            const response = await notionauth.fetchnotionacc()
            if (!response.success) throw new Error(response.message || "Failed to fetch notion account")
            return response.data!
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        retry: false,
    })
}
