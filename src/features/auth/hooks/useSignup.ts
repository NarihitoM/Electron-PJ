import { useMutation } from "@tanstack/react-query"
import { userauthapi } from "../api/api"

export const useSignup = () => {
    return useMutation({
        mutationFn: ({ username, useremail, userpassword, userconfirmpassword }: {
            username: string; useremail: string; userpassword: string; userconfirmpassword: string
        }) => userauthapi.signup(username, useremail, userpassword, userconfirmpassword),
    })
}
