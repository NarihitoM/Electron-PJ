import { useMutation, useQueryClient } from "@tanstack/react-query"
import { agentauth } from "../api/api"

export const useDeleteAgentNode = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (nodeid: string) => agentauth.deletenode(nodeid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["node"] })
            queryClient.refetchQueries({ queryKey: ["dashboard-stats"] })
        },
    })
}
