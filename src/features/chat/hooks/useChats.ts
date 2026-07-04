import { useQuery } from "@tanstack/react-query"
import { chatauth } from "../api/api"
import type { chatfetch } from "../types"

export const useChats = () => {
    return useQuery<chatfetch[]>({
        queryKey: ["chat"],
        queryFn: async () => {
            const response = await chatauth.fetchchat()
            if (!response.success) throw new Error(response.message || "Failed to fetch chats")
            return response.data?.messages ?? []
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        retry: false,
    })
}
