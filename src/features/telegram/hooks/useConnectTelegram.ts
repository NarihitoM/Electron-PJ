import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Server } from "../../../shared/config/axioconfig"

export const useConnectTelegram = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await Server.post("/telegram/api/telegramstate")
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["telegram"] })
        },
    })
}
