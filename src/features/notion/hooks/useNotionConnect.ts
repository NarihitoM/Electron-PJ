import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notionauth } from "../api/api"

export const useNotionConnect = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => notionauth.notionstate(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notion"] })
        },
    })
}
