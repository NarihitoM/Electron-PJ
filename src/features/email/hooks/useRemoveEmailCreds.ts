import { useMutation, useQueryClient } from "@tanstack/react-query"
import { emailcredapi } from "../api/api"

export const useRemoveEmailCreds = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => emailcredapi.delete(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-creds"] })
        },
    })
}
