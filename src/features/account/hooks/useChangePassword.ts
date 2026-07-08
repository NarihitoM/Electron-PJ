import { useMutation } from "@tanstack/react-query"
import { accountauth } from "../api/api"

export const useChangePassword = () => {
    return useMutation({
        mutationFn: ({ currentpassword, newpassword }: { currentpassword: string; newpassword: string }) =>
            accountauth.passwordreset(currentpassword, newpassword),
    })
}
