import { useMutation } from "@tanstack/react-query"
import { userauthapi } from "../api/api"

export const useChangePassword = () => {
    return useMutation({
        mutationFn: ({ currentpassword, newpassword }: { currentpassword: string; newpassword: string }) =>
            userauthapi.passwordreset(currentpassword, newpassword),
    })
}
