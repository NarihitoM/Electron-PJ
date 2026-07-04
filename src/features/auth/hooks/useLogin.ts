import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userauthapi } from "../api/api"

export const useLogin = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ useremail, userpassword }: { useremail: string; userpassword: string }) =>
            userauthapi.login(useremail, userpassword),
        onSuccess: () => {
            queryClient.invalidateQueries()
        },
    })
}
