import { useQuery } from "@tanstack/react-query"
import { googleauth } from "../api/api"

export const useGoogleDocs = () => {
    return useQuery({
        queryKey: ["docs"],
        queryFn: () => googleauth.fetchdocsmessage(),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        retry: false,
    })
}
