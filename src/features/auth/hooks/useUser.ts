import { useQuery } from "@tanstack/react-query"
import { userauthapi } from "../api/api"
import type { User } from "../types/type"

export const useUser = () => {
    return useQuery<User | null>({
        queryKey: ["user"],
        queryFn: async () => {
            const response = await userauthapi.fetchuser()
            if (!response.success) return null
            return response.data ?? null
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        retry: false,
    })
}
