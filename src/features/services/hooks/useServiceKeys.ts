import { useQuery } from "@tanstack/react-query"
import { serviceauth } from "../api/api"
import type { Servicefetch } from "../types/type"

export const useServiceKeys = () => {
    return useQuery<Servicefetch[]>({
        queryKey: ["key"],
        queryFn: async () => {
            const response = await serviceauth.servicefetch()
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch service keys")
            }
            return response.data ?? []
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 10,
        retry: false,
    })
}
