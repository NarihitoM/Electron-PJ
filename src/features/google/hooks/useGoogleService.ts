import { useQuery } from "@tanstack/react-query"
import { googleauth } from "../api/api"

export const useGoogleService = () => {
    return useQuery({
        queryKey: ["google"],
        queryFn: async () => {
            const response = await googleauth.fetchgoogleservice()
            if (!response.success) return null
            return response.data ?? null
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        retry: false,
    })
}
