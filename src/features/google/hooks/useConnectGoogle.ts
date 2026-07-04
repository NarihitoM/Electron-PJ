import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Server } from "../../../shared/config/axioconfig"

export const useConnectGoogle = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await Server.post("/google/api/authurl")
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["google"] })
        },
    })
}
