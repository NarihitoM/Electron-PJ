import { useQuery } from "@tanstack/react-query"
import { slackauth } from "../api/api"

export const useSlackAccount = () => {
    return useQuery({
        queryKey: ["slack"],
        queryFn: async () => {
            const response = await slackauth.slackacc()
            if (!response.success) return null
            return response.data ?? null
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        retry: false,
    })
}
