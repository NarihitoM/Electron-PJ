import { useMutation, useQueryClient } from "@tanstack/react-query"
import { n8nauth } from "../api/api"

export const useDeleteN8nService = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => n8nauth.n8ndeleteservice(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["n8nconfig"] })
        },
    })
}
