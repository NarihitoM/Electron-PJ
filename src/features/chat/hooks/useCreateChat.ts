import { useMutation, useQueryClient } from "@tanstack/react-query"
import { chatauth } from "../api/api"

export const useCreateChat = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => chatauth.createchat(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat"] })
            queryClient.refetchQueries({ queryKey: ["dashboard-stats"] })
        },
    })
}
