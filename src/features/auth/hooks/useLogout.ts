import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userauthapi } from "../api/api"

export const useLogout = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => userauthapi.logout(),
        onSuccess: () => {
            queryClient.clear()
        },
    })
}
