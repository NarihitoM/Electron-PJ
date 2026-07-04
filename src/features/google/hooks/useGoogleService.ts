import { useQuery } from "@tanstack/react-query"
import { googleauth } from "../api/api"

export const useGoogleService = () => {
    return useQuery({
        queryKey: ["google"],
        queryFn: async () => {
            const response = await googleauth.fetchgoogleservice()
            if (!response.success) throw new Error(response.message || "Failed to fetch google service")
            return response.data ?? null
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        retry: false,
    })
}
