import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Bot } from "lucide-react"
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys"
import { useagentstore } from "../store/store"

export const AgentChatHeader = () => {
    const { data: Api = [] } = useServiceKeys()
    const store = useagentstore()

    const onAddNode = () => {
        store.setNodeDialogMode("create")
        store.resetForm()
        store.setNodeDialogOpen(true)
    }

    const onAddProvider = () => {
        store.setServicesOpen(true)
    }

    return (
        <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold flex gap-3 items-center">
                    <Bot className="w-6 h-6 text-cyan-500 dark:text-white" />
                    Multimate-MultiAgent
                </h1>
                <p className="text-muted-foreground">Ai that does work.</p>
            </div>
            <div className="flex gap-2 items-center">
                {store.messageloading ? (
                    <span className="flex items-center gap-2 px-1 py-1 rounded-full border border-transparent">
                        <Skeleton className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                    </span>
                ) : (
                    <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                        Up To Date
                    </Badge>
                )}
                {store.nodes.length > 0 || Api.length > 0 ? (
                    <Button
                        onClick={onAddNode}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-white dark:text-black"
                    >
                        Add Node
                    </Button>
                ) : (
                    <Button
                        className="bg-cyan-500 dark:bg-white"
                        onClick={onAddProvider}
                    >
                        Add Provider
                    </Button>
                )}
            </div>
        </div>
    )
}
