import { useEffect, useRef } from "react"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Spinner } from "@/shared/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"
import { motion } from "framer-motion"
import { AlertTriangle, Bot, Check, ChevronDown, Copy, Cpu, Dot, Loader2, Terminal, XCircle } from "lucide-react"
import { BRAND_ASSETS } from "@/shared/config/providermodels"
import { extractToolMessage } from "@/shared/utils/toolutils"
import AiContent from "@/shared/components/layout/LayoutAiresponse"
import { useUser } from "@/features/auth/hooks/useUser"
import { n8nauthstore } from "../store/store"
import { n8nauth } from "../api/api"
import { toast } from "sonner"

export const N8nMessageList = () => {
    const { data: userdata } = useUser()
    const store = n8nauthstore()

    const topSentinelRef = useRef<HTMLDivElement | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const prevMessageCountRef = useRef(store.sessionmessage.length)

    useEffect(() => {
        if (store.sessionmessage.length > prevMessageCountRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
        }
        prevMessageCountRef.current = store.sessionmessage.length
    }, [store.sessionmessage])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
    }, [store.sending])

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && store.hasMore && !store.loadingMore) {
                loadMore()
            }
        }, { threshold: 0.1 })
        const el = topSentinelRef.current
        if (el) observer.observe(el)
        return () => observer.disconnect()
    }, [store.hasMore, store.loadingMore])

    const loadMore = async () => {
        if (!store.nextCursor || !store.hasMore || store.loadingMore) return
        store.setLoadingMore(true)
        try {
            const prevScrollHeight = scrollContainerRef.current?.scrollHeight ?? 0
            const response = await n8nauth.fetchn8nmsg(store.nextCursor)
            if (response.success && response.data) {
                const data = response.data
                store.updateSessionMessages(prev => [...(data.messages ?? []), ...prev])
                store.setNextCursor(data.nextCursor)
                store.setHasMore(data.hasMore)
                requestAnimationFrame(() => {
                    const el = scrollContainerRef.current
                    if (el) el.scrollTop = el.scrollHeight - prevScrollHeight
                })
            }
        } catch { /* silence */ }
        finally { store.setLoadingMore(false) }
    }

    const fetchMessages = async () => {
        store.setloadingfetch(true)
        store.setloadingerror(false)
        store.setsessionmessage([])
        store.setNextCursor(null)
        store.setHasMore(false)
        try {
            const response = await n8nauth.fetchn8nmsg()
            if (response.success && response.data) {
                store.setsessionmessage(response.data.messages ?? [])
                store.setNextCursor(response.data.nextCursor)
                store.setHasMore(response.data.hasMore)
            }
        } catch (err: unknown) {
            store.setloadingerror(true)
            const errMsg = err instanceof Error ? (err as any).response?.data?.message || err.message : "An unexpected error occurred."
            toast.error(errMsg)
        } finally { store.setloadingfetch(false) }
    }

    useEffect(() => { fetchMessages() }, [])

    const userperson =
        <Avatar className="w-7 h-7 dark:border-2 border-black">
            <AvatarImage src={userdata?.profileurl || undefined} />
            <AvatarFallback className="dark:bg-neutral-700 dark:text-neutral-300">{userdata?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>

    if (store.loadingfetch) {
        return (
            <div className="flex-1 overflow-y-auto p-4" ref={scrollContainerRef}>
                <div className="mx-auto max-w-3xl space-y-6 mt-20">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-3 justify-end">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-4 w-[150px]" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (store.loadingerror) {
        return (
            <div className="flex-1 overflow-y-auto p-4" ref={scrollContainerRef}>
                <div className="mx-auto max-w-3xl text-center mt-20">
                    <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Failed to load messages</h2>
                    <p className="text-muted-foreground mb-6">There was an error loading your chat messages. Please try again.</p>
                    <Button onClick={fetchMessages} variant="default" size="lg" className="cursor-pointer"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Retry</Button>
                </div>
            </div>
        )
    }

    const hasMessages = store.sessionmessage.length > 0

    return (
        <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4"
        >
            <div ref={topSentinelRef} />
            <div className="mx-auto max-w-3xl space-y-6">
                {store.loadingMore && (
                    <div className="flex justify-center py-4">
                        <Spinner className="h-6 w-6" />
                    </div>
                )}
                {!hasMessages && !store.loadingfetch ? (
                    <div className="flex flex-col items-center justify-center h-full text-center mt-20">
                        <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Start a conversation</h2>
                        <p className="text-muted-foreground">Ask your AI agent to manage n8n workflows.</p>
                    </div>
                ) : <></>}
                {store.sessionmessage.map((mes, index) => (
                    <motion.div
                        key={`${index}-message`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start gap-3 ${mes.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {mes.role === "assistant" && (
                            <Avatar className="w-7 h-7 dark:border-2 border-black shrink-0">
                                <AvatarImage src={BRAND_ASSETS[mes.provider?.toLowerCase() || ""]} />
                                <AvatarFallback className="dark:bg-neutral-700 dark:text-neutral-300"><Cpu className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`max-w-[80%] ${mes.role === "user" ? "order-1" : "order-2"}`}>
                            {mes.role === "user" ? (
                                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
                                    {mes.images && mes.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {mes.images.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={store.uploadingImageUrls?.has(img) ? img : img}
                                                    alt={`Uploaded ${i}`}
                                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => { store.setLightboxImages(mes.images!); store.setLightboxIndex(i); store.setLightboxOpen(true) }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <div className="text-sm whitespace-pre-wrap break-words"><AiContent content={mes.content} /></div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {(mes.content || mes.toolsCall?.length) && (
                                        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                            {mes.content && (() => {
                                                const extracted = extractToolMessage(mes.content)
                                                if (extracted && !mes.toolsCall?.length) {
                                                    return <div className="text-sm whitespace-pre-wrap break-words"><AiContent content={extracted} /></div>
                                                }
                                                return (
                                                    <div className="text-sm whitespace-pre-wrap break-words">
                                                        <AiContent content={mes.content} />
                                                    </div>
                                                )
                                            })()}
                                            {mes.toolsCall && mes.toolsCall.length > 0 && (
                                                <div className="flex flex-col gap-1.5 mt-2 border-t pt-2">
                                                    {mes.toolsCall.map((tool, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs">
                                                            <div className="flex items-center gap-1 flex-1 min-w-0">
                                                                <Terminal className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                                <span className="font-medium truncate">{tool.name}</span>
                                                                {tool.query && (
                                                                    <Collapsible className="flex-1 min-w-0">
                                                                        <CollapsibleTrigger className="text-muted-foreground hover:text-foreground text-xs cursor-pointer">
                                                                            <ChevronDown className="h-3 w-3 inline" />
                                                                        </CollapsibleTrigger>
                                                                        <CollapsibleContent>
                                                                            <pre className="text-xs bg-background p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(tool.query, null, 2)}</pre>
                                                                        </CollapsibleContent>
                                                                    </Collapsible>
                                                                )}
                                                            </div>
                                                            {tool.status === "loading" ? (
                                                                <Dot className="h-4 w-4 animate-pulse text-blue-500 shrink-0" />
                                                            ) : tool.status === "done" ? (
                                                                <Check className="h-3 w-3 text-green-500 shrink-0" />
                                                            ) : tool.status === "rejected" ? (
                                                                <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                                                            ) : (
                                                                <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {mes.generatedImages && mes.generatedImages.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {mes.generatedImages.map((url, i) => (
                                                <div key={i} className="relative group cursor-pointer" onClick={() => { store.setLightboxImages(mes.generatedImages!); store.setLightboxIndex(i); store.setLightboxOpen(true) }}>
                                                    <img src={url} alt={`Generated ${i}`} className="w-40 h-40 object-cover rounded-lg" />
                                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(url); store.setCopiedIndex(i); setTimeout(() => store.setCopiedIndex(null), 2000) }}
                                                    >
                                                        <Button size="icon" variant="secondary" className="h-6 w-6">
                                                            {store.copiedIndex === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {mes.role === "user" && userperson}
                    </motion.div>
                ))}
                {store.sending && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 justify-start"
                    >
                        <Avatar className="w-7 h-7 dark:border-2 border-black shrink-0">
                            <AvatarFallback className="dark:bg-neutral-700 dark:text-neutral-300"><Cpu className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Dot className="h-5 w-5 animate-pulse text-blue-500" />
                                <span className="text-xs text-muted-foreground">Thinking</span>
                                <span className="flex gap-0.5">
                                    <span className="w-1 h-1 rounded-full bg-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1 h-1 rounded-full bg-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1 h-1 rounded-full bg-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
            <div ref={messagesEndRef} />
        </div>
    )
}
