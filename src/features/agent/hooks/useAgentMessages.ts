import { useQuery } from "@tanstack/react-query"
import { agentauth } from "../api/api"

export const useAgentMessages = (cursor?: string, name?: string) => {
    return useQuery({
        queryKey: ["agentmsg", cursor ?? "", name ?? ""],
        queryFn: () => agentauth.fetchagentmessages(cursor, name),
        staleTime: 0,
        retry: false,
    })
}
