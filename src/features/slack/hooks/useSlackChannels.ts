import { useQuery } from "@tanstack/react-query"
import { slackauth } from "../api/api"

export const useSlackChannels = () => {
    return useQuery({
        queryKey: ["slackchannels"],
        queryFn: async () => {
            const response = await slackauth.slackacc()
            if (!response.success) throw new Error(response.message || "Failed to fetch channels")
            return Array.isArray(response.data) ? response.data : []
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        retry: false,
    })
}
