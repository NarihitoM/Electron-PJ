import { useMutation, useQueryClient } from "@tanstack/react-query"
import { serviceauth } from "../api/api"
import type { authservicefeedback } from "../types/type"

export const useDeleteServiceKey = () => {
    const queryClient = useQueryClient()

    return useMutation<authservicefeedback, Error, number>({
        mutationFn: (id) => serviceauth.servicedelete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["key"] })
            queryClient.refetchQueries({ queryKey: ["dashboard-stats"] })
        },
    })
}
