import { useMutation, useQueryClient } from "@tanstack/react-query"
import { n8nauth } from "../api/api"

export const useConnectN8n = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ n8nUrl, authType, authValue }: { n8nUrl: string; authType: string; authValue?: string }) =>
            n8nauth.connect(n8nUrl, authType, authValue),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["n8nconfig"] })
        },
    })
}
