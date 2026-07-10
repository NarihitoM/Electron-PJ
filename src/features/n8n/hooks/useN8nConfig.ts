import { useQuery } from "@tanstack/react-query"
import { n8nauth } from "../api/api"

export const useN8nConfig = () => {
    return useQuery({
        queryKey: ["n8n"],
        queryFn: async () => {
            const response = await n8nauth.getConfig()
            if (!response.success) return null
            return response.data ?? null
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        retry: false,
    })
}
