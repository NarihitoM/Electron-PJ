import { useEffect } from "react"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Bot, EllipsisVertical, PenBox, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { BRAND_ASSETS } from "@/shared/config/providermodels"
import { ToolLabels } from "@/shared/config/toolsselection"
import { motion } from "framer-motion"
import AiContent from "@/shared/components/layout/LayoutAiresponse"
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys"
import { useAgentNodes } from "@/features/agent/hooks/useAgentNodes"
import { useagentstore } from "../store/store"

export const AgentNodeList = () => {
    const store = useagentstore()
    const { data: Api = [] } = useServiceKeys()
    const { data: fetchedNodes = [], isLoading: loadingfetch } = useAgentNodes()

    useEffect(() => {
        if (fetchedNodes.length > 0) {
            store.setNodes(fetchedNodes as any)
        }
    }, [fetchedNodes])

    const nodes = store.nodes

    const onUpdate = (idx: number) => {
        const node = nodes[idx]
        store.setNodeid(node.id)
        store.setName(node.name)
        store.setActor(node.actor)
        store.setPrompt((node as any).systemprompt || "")
        store.setProvider(node.provider)
        store.setModel(node.model)
        store.setTool(node.tool)
        store.setNodeDialogMode("update")
        store.setNodeDialogOpen(true)
    }

    const onDelete = (idx: number) => {
        const node = nodes[idx]
        store.setNodeid(node.id)
        store.setName(node.name)
        store.setNodeDialogMode("delete")
        store.setNodeDialogOpen(true)
    }

    const onAddNode = () => {
        store.setNodeDialogMode("create")
        store.resetForm()
        store.setNodeDialogOpen(true)
    }

    const onAddProvider = () => {
        store.setServicesOpen(true)
    }

    if (loadingfetch) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <Card key={i} className="flex flex-col p-4 h-30 shadow-sm">
                        <div className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 w-full">
                                    <Skeleton className="h-5 w-[60%]" />
                                    <Skeleton className="h-3 w-[40%]" />
                                </div>
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )
    }

    if (nodes.length > 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodes.map((element, idx) => {
                    const isActive = element.status === "running"
                    return (
                        <Card key={idx} className={`relative transition-all duration-300 p-4 ${isActive ? "border-cyan-500 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] bg-cyan-50/5 dark:bg-cyan-950/10 z-10" : "border-border opacity-80 hover:border-cyan-500/50"}`}>
                            {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-[pulse_2s_infinite]" />}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-lg max-lg:text-sm font-semibold">
                                        <Bot className={`text-cyan-500 dark:text-white ${isActive ? "animate-bounce" : ""}`} />
                                        {element.name}
                                        <p className={`text-[10px] px-2 py-1 rounded-full border transition-all duration-300 ${isActive ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"}`}>
                                            {isActive ? "ACTIVE" : element.actor}
                                        </p>
                                    </div>
                                    <div className="text-xs flex gap-1 items-center">
                                        <img src={BRAND_ASSETS[element.provider.toLowerCase()]} className="bg-white rounded-lg p-0.5 w-5 h-5" />
                                        <span className="font-bold">{element.model}</span>
                                    </div>
                                    <div className="text-xs">
                                        Tools: <span className="text-green-500"> {ToolLabels[element.tool] || element.tool} </span>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="dark:hover:bg-zinc-700 hover:bg-black/10 p-1 rounded-full">
                                        <EllipsisVertical size={17} className="text-muted-foreground dark:text-white" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdate(idx) }} className="flex">
                                            <PenBox /> Update
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 flex" onClick={(e) => { e.stopPropagation(); onDelete(idx) }}>
                                            <Trash /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="mt-3 flex-1 overflow-y-auto max-h-75 text-sm" style={{ scrollbarWidth: "none" }}>
                                {element.activeTool && (
                                    <div className="flex items-center gap-2 text-xs text-amber-500 font-medium animate-pulse">
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                        Using Tool: {element.activeTool}
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap">
                                    {element.output || element.activeTool ? (
                                        <AiContent content={element.output!} />
                                    ) : element.thinking ? (
                                        <AiContent content={element.thinking} />
                                    ) : (
                                        <motion.span
                                            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                            style={{ backgroundImage: "linear-gradient(90deg, #6b7280 0%, #f3f4f6 50%, #6b7280 100%)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                                            className="italic"
                                        >
                                            Awaiting sequence...
                                        </motion.span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="min-h-[60vh] flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl font-semibold mb-2">Build your Agent Chain</h1>
            <p className="text-muted-foreground mb-6">Connect multiple models to solve complex tasks.</p>
            {Api.length > 0 ? (
                <Button onClick={onAddNode} className="bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-white dark:text-black">
                    Add First Node
                </Button>
            ) : (
                <Button className="bg-cyan-500 dark:bg-white" onClick={onAddProvider}>
                    Add Provider
                </Button>
            )}
        </div>
    )
}
