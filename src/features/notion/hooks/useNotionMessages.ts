import { useQuery } from "@tanstack/react-query"
import { notionauth } from "../api/api"

export const useNotionMessages = (cursor?: string, limit?: number) => {
    return useQuery({
        queryKey: ["notionmsg", cursor ?? "", limit ?? 10],
        queryFn: () => notionauth.fetchnotionmsg(cursor, limit),
        staleTime: 0,
        retry: false,
    })
}
