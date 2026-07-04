import { useEffect, useRef } from "react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Spinner } from "@/shared/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { motion } from "framer-motion"
import { Bot, Check, Copy } from "lucide-react"
import { BRAND_ASSETS } from "@/shared/config/providermodels"
import AiContent from "@/shared/components/layout/LayoutAiresponse"
import { useUser } from "@/features/auth/hooks/useUser"
import { useagentstore } from "../store/store"
import { agentauth } from "../api/api"
import { toast } from "sonner"

export const AgentChatArea = () => {
    const { data: userdata } = useUser()
    const store = useagentstore()
    const prevMessageCountRef = useRef(store.history.length)

    useEffect(() => {
        if (store.history.length > prevMessageCountRef.current) {
            store.historyEndRef.current?.scrollIntoView({ behavior: "auto" })
        }
        prevMessageCountRef.current = store.history.length
    }, [store.history])

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && store.hasMore && !store.loadingMore) {
                loadMoreHistory()
            }
        }, { threshold: 0.1 })
        const el = store.topSentinelRef.current
        if (el) observer.observe(el)
        return () => observer.disconnect()
    }, [store.hasMore, store.loadingMore])

    const loadMoreHistory = async () => {
        if (!store.nextCursor || !store.hasMore || store.loadingMore) return
        store.setLoadingMore(true)
        try {
            const container = store.scrollContainerRef.current
            const prevScrollHeight = container?.scrollHeight ?? 0
            const response = await agentauth.fetchagentmessages(store.nextCursor)
            if (response.success && response.data) {
                const data = response.data
                store.updateHistory(prev => [...(data.messages ?? []).reverse(), ...prev])
                store.setNextCursor(data.nextCursor)
                store.setHasMore(data.hasMore)
                requestAnimationFrame(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - prevScrollHeight
                    }
                })
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any
                toast.error(Error.response?.data?.message || err.message)
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            store.setLoadingMore(false)
        }
    }

    if (store.loadingfetch) {
        return (
            <div className="flex flex-col gap-4 p-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex items-start gap-3 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}>
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-4 w-[180px]" />
                            <Skeleton className="h-4 w-[120px]" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (store.loadingerror) {
        return (
            <div className="flex flex-col gap-3 justify-center items-center py-10">
                <p className="text-sm text-muted-foreground">Failed to load history.</p>
            </div>
        )
    }

    return (
        <div
            ref={store.scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 pb-4"
            style={{ scrollbarWidth: "none" }}
        >
            <div className="flex flex-col gap-4">
                <div ref={store.topSentinelRef} className="h-1" />
                {store.loadingMore && (
                    <div className="flex justify-center py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Spinner className="h-5 w-5 text-cyan-500 dark:text-white" />
                            Loading...
                        </div>
                    </div>
                )}
                {store.history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">No history yet.</p>
                ) : (
                    store.history.map((msg, index) => {
                        const isUser = msg.role === "user"
                        return (
                            <div key={index} className={`group mb-4 flex w-full gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-1">
                                    {isUser ? (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={userdata?.profileurl ? `${userdata.profileurl}?v=${userdata?.useremail}` : undefined} alt={userdata?.username} />
                                            <AvatarFallback className="bg-cyan-500 dark:bg-white border text-white dark:text-black">
                                                {userdata?.username?.substring(0, 1) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : (() => {
                                        const node = store.nodes.find(n => n.name === msg.name)
                                        const prov = msg.provider || node?.provider
                                        return prov && BRAND_ASSETS[prov] ? (
                                            <img src={BRAND_ASSETS[prov]} className="w-7 h-7 rounded bg-white dark:bg-card" />
                                        ) : (
                                            <Bot className="h-5 w-5 text-cyan-500 dark:text-white relative" />
                                        )
                                    })()}
                                </div>

                                <div className={`flex flex-col gap-1 max-w-[85%] min-w-0 ${isUser ? "items-end text-right" : "items-start text-left"}`}>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {isUser ? userdata?.username : msg.name || "Agent"}
                                    </span>
                                    {!isUser && (() => {
                                        const node = store.nodes.find(n => n.name === msg.name)
                                        const mdl = msg.model || node?.model
                                        return mdl ? (
                                            <span className="text-[10px] font-mono text-muted-foreground/70">{mdl}</span>
                                        ) : null
                                    })()}

                                    <div className={`py-2 rounded-2xl leading-relaxed text-[15px] whitespace-pre-wrap w-full overflow-hidden ${isUser ? "bg-muted text-foreground rounded-tr-none p-3" : "bg-transparent text-foreground rounded-tl-none"}`}>
                                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="wrap-break-word w-full">
                                            <AiContent content={msg.content} />
                                        </motion.div>
                                    </div>
                                    {msg.content && (
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(msg.content)
                                            store.setCopiedIndex(index)
                                            setTimeout(() => store.setCopiedIndex(null), 1500)
                                        }} className={`${store.copiedIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity p-1 rounded self-end -mt-1`}>
                                            {store.copiedIndex === index ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={store.historyEndRef} />
            </div>
        </div>
    )
}
