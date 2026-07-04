import { useMutation, useQueryClient } from "@tanstack/react-query"
import { agentauth } from "../api/api"

export const useResetAgentMessages = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (name?: string) => agentauth.resetagentmessages(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["node"] })
            queryClient.refetchQueries({ queryKey: ["dashboard-stats"] })
        },
    })
}
