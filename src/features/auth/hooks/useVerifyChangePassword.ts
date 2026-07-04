import { useMutation } from "@tanstack/react-query"
import { userauthapi } from "../api/api"

export const useVerifyChangePassword = () => {
    return useMutation({
        mutationFn: ({ email }: { email: string }) =>
            userauthapi.changepasswordreset(email),
    })
}
