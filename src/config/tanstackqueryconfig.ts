import { QueryClient } from "@tanstack/react-query"

export const datafetch = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 10000,
            gcTime : 1000 * 60 * 10
        }
    }
})