import { useMutation, useQueryClient } from "@tanstack/react-query"
import { slackauth } from "../api/api"

export const useConnectSlack = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => slackauth.slackstate(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["slack"] })
        },
    })
}
