import { useMutation, useQueryClient } from "@tanstack/react-query"
import { chatauth } from "../api/api"

export const useDeleteChat = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (chatid: string) => chatauth.deletechat(chatid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat"] })
            queryClient.refetchQueries({ queryKey: ["dashboard-stats"] })
        },
    })
}
