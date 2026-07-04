import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notionauth } from "../api/api"

export const useDisconnectNotion = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => notionauth.notiondeleteservice(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notion"] })
            queryClient.refetchQueries({ queryKey: ["dashboard-stats"] })
        },
    })
}
