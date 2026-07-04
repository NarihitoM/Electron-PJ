import { useQuery } from "@tanstack/react-query"
import { emailcredapi, type EmailCredentialData } from "../api/api"

export const useEmailCreds = () => {
    return useQuery<{ exists: boolean; data: EmailCredentialData | null }>({
        queryKey: ["email-creds"],
        queryFn: async () => {
            const response = await emailcredapi.fetch()
            if (response.success && response.exists && response.data) {
                return { exists: true, data: response.data }
            }
            return { exists: false, data: null }
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 10,
        retry: false,
    })
}
