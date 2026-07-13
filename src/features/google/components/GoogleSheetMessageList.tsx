import { useEffect, useRef } from "react"
import { CheckCircle2, ChevronDown, Terminal, Cpu, Bot, Copy, Check, AlertTriangle, Loader2, XCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Spinner } from "@/shared/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"
import { motion } from "framer-motion"
import { BRAND_ASSETS } from "@/shared/config/providermodels"
import AiContent from "@/shared/components/layout/LayoutAiresponse"
import ThinkingBlock from "@/shared/components/ui/ThinkingBlock"
import ShimmerLoadingText from "@/shared/components/ui/ShimmerLoadingText"
import { extractToolMessage } from "@/shared/utils/toolutils"
import { Googlesheettool } from "@/shared/config/toolsselection"
import { useUser } from "@/features/auth/hooks/useUser"
import { useGoogleService } from "@/features/google/hooks/useGoogleService"
import { googleauthstore } from "../store/store"
import { googleauth } from "../api/api"
import { toast } from "sonner"

export const GoogleSheetMessageList = () => {
    const { data: userdata } = useUser()
    const { data: googleService } = useGoogleService()
    const store = googleauthstore()

    const serviceemail = (googleService as any)?.email ?? ""

    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const topSentinelRef = useRef<HTMLDivElement | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const isNearBottomRef = useRef(true)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
    }

    // Scroll to bottom on initial mount
    useEffect(() => {
        const timer = requestAnimationFrame(() => scrollToBottom())
        return () => cancelAnimationFrame(timer)
    }, [])

    useEffect(() => {
        const el = messagesEndRef.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => {
            isNearBottomRef.current = entry.isIntersecting
        }, { threshold: 0.1 })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (isNearBottomRef.current) scrollToBottom()
    }, [store.sessionmessage_sheet])

    useEffect(() => {
        scrollToBottom()
    }, [store.sending_sheet])

    const loadMore = async () => {
        if (!store.nextCursor_sheet || !store.hasMore_sheet || store.loadingMore_sheet) return
        store.setLoadingMore_sheet(true)
        try {
            const container = scrollContainerRef.current
            const prevScrollHeight = container?.scrollHeight ?? 0

            const response = await googleauth.fetchsheetmessage(store.nextCursor_sheet)
            if (response.success && response.data) {
                const data = response.data
                store.updateSessionMessages_sheet(prev => [...(data.messages ?? []), ...prev])
                store.setNextCursor_sheet(data.nextCursor)
                store.setHasMore_sheet(data.hasMore)

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
            store.setLoadingMore_sheet(false)
        }
    }

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && store.hasMore_sheet && !store.loadingMore_sheet) {
                loadMore()
            }
        }, { threshold: 0.1 })

        const el = topSentinelRef.current
        if (el) observer.observe(el)

        return () => observer.disconnect()
    }, [store.hasMore_sheet, store.loadingMore_sheet])

    const fetchMessages = async () => {
        try {
            store.setloadingfetch_sheet(true)
            store.setloadingerror_sheet(false)
            store.setSending_sheet(false)

            store.setsessionmessage_sheet([])
            store.setNextCursor_sheet(null)
            store.setHasMore_sheet(false)
            const response = await googleauth.fetchsheetmessage()
            if (response.success && response.data) {
                store.setsessionmessage_sheet(response.data.messages ?? [])
                store.setNextCursor_sheet(response.data.nextCursor)
                store.setHasMore_sheet(response.data.hasMore)
            }
        } catch (err: unknown) {
            store.setloadingerror_sheet(true)
            if (err instanceof Error) {
                const Error = err as any
                toast.error(Error.response?.data?.message || err.message)
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            store.setloadingfetch_sheet(false)
        }
    }

    useEffect(() => {
        fetchMessages()
    }, [])

    return (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
            <div className="mx-auto max-w-5xl py-5">
                {(store.loadingfetch_sheet) ? (
                    <div className="mx-auto max-w-5xl py-5 space-y-8 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col gap-8">
                                <div className="flex w-full gap-4 flex-row-reverse">
                                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                    <div className="flex flex-col gap-2 items-end w-full">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-16 w-[60%] rounded-2xl rounded-tr-none" />
                                    </div>
                                </div>

                                <div className="flex w-full gap-4 flex-row">
                                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                    <div className="flex flex-col gap-2 items-start w-full">
                                        <Skeleton className="h-3 w-24" />
                                        <div className="space-y-2 w-[80%]">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-[90%]" />
                                            <Skeleton className="h-4 w-[40%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : store.loadingerror_sheet ? (
                    <div className="min-h-[50vh] flex flex-col gap-3 justify-center items-center">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                        <h1 className="text-2xl font-semibold">Failed To Load</h1>
                        <p className="text-sm text-muted-foreground">There was a problem connecting to the server.</p>
                        <Button onClick={fetchMessages} className="bg-cyan-500 dark:bg-white">Retry</Button>
                    </div>
                ) :
                    (store.sessionmessage_sheet && store.sessionmessage_sheet.length > 0 ?
                        (<><div ref={topSentinelRef} />
                            {store.loadingMore_sheet && <div className="flex justify-center py-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner className="h-5 w-5 text-cyan-500 dark:text-white" />Loading...</div></div>}
                            {store.sessionmessage_sheet.map((msg, index) => {
                                const isUser = msg.role === "user"
                                const isLastMessage = index === store.sessionmessage_sheet.length - 1
                                const username = userdata?.username
                                return (
                                    <div
                                        key={`${index}-msg`}
                                        className={`group mb-8 flex w-full gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full mt-1">
                                            {isUser ? (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={
                                                            userdata?.profileurl
                                                                ? `${userdata.profileurl}?v=${userdata?.useremail}`
                                                                : undefined
                                                        }
                                                        alt={userdata?.username}
                                                    />
                                                    <AvatarFallback className="bg-cyan-500 dark:bg-white border text-white dark:text-black">
                                                        {userdata?.username.substring(0, 1)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className="relative flex items-center justify-center">
                                                    {msg.provider && BRAND_ASSETS[msg.provider] ? (
                                                        <img src={BRAND_ASSETS[msg.provider]} className="w-7 h-7 rounded bg-white dark:bg-card" />
                                                    ) : (
                                                        <Bot className="w-7 h-7 text-muted-foreground" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className={`flex flex-col gap-1 max-w-[80%] min-w-0 ${isUser ? "items-end text-left" : "items-start text-left"}`}
                                        >
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                                {isUser ? username : ""}
                                            </span>
                                            {!isUser && msg.model && (
                                                <span className="text-[10px] font-mono text-muted-foreground/70">{msg.model}</span>
                                            )}
                                            {!isUser && store.sending_sheet && isLastMessage && !msg.content && (!msg.toolsCall || msg.toolsCall.length === 0 || msg.toolsCall.some((t: any) => t.status === "loading")) && (
                                                <ShimmerLoadingText className="mt-0.5" />
                                            )}

                                            {isUser && msg.images && msg.images.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-1">
                                                    {msg.images.map((url, i) => (
                                                        <div
                                                            key={i}
                                                            className="relative w-20 h-20 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => {
                                                                store.setLightboxImages_sheet(msg.images!)
                                                                store.setLightboxIndex_sheet(i)
                                                                store.setLightboxOpen_sheet(true)
                                                            }}
                                                        >
                                                            <img src={url} alt="attached" className="w-full h-full object-cover" />
                                                            {store.uploadingImageUrls_sheet.has(url) && (
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                    <Loader2 size={20} className="text-white animate-spin" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {!isUser && msg.generatedImages && msg.generatedImages.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {msg.generatedImages.map((url, i) => (
                                                        <div
                                                            key={i}
                                                            className="relative rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity max-w-75"
                                                            onClick={() => {
                                                                store.setLightboxImages_sheet(msg.generatedImages!)
                                                                store.setLightboxIndex_sheet(i)
                                                                store.setLightboxOpen_sheet(true)
                                                            }}
                                                        >
                                                            <img src={url} alt="generated" className="w-full h-auto object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div
                                                className={`rounded-2xl leading-relaxed text-[15px] whitespace-pre-wrap w-full overflow-hidden wrap-break-word min-w-0 ${isUser
                                                    ? "bg-muted text-foreground rounded-tr-none p-3"
                                                    : "bg-transparent text-foreground rounded-tl-none"
                                                    }`}
                                            >
                                                {msg.thinking && <ThinkingBlock thinking={msg.thinking} isStreaming={store.sending_sheet && index === store.sessionmessage_sheet.length - 1} />}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="wrap-break-word p-1"
                                                >
                                                <div className="grid grid-cols-1 gap-2 mb-1 w-fit">
                                                    {msg.toolsCall?.filter((t: any) => !t.isChain).map((tool: any) => (
                                                        <Collapsible key={tool.id} className="w-full space-y-2">
                                                            <CollapsibleTrigger asChild>
                                                                <Button variant="ghost" className={`group flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${tool.status === "done"
                                                                    ? "text-muted-foreground shadow-sm"
                                                                    : "text-muted-foreground"
                                                                    }`}>
                                                                    {tool.status === "loading" && (
                                                                        <Spinner className="w-4 h-4 animate-spin text-cyan-500 dark:text-white" />
                                                                    )}
                                                                    {tool.status === "done" && (
                                                                        <CheckCircle2 size={12} className="text-green-500" />
                                                                    )}
                                                                    {tool.status === "error" && (
                                                                        <XCircle size={12} className="text-red-500" />
                                                                    )}
                                                                    {tool.status === "rejected" && (
                                                                        <XCircle size={12} className="text-red-500" />
                                                                    )}
                                                                    {tool.status === "loading" ? <motion.span
                                                                        animate={{ opacity: [1, 0.5, 1] }}
                                                                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                                                        className="text-foreground"
                                                                    >{Googlesheettool[tool.name.toLowerCase()]}
                                                                    </motion.span > :
                                                                        <span>
                                                                            {Googlesheettool[tool.name.toLowerCase()]}
                                                                        </span>}
                                                                    {tool.status !== "loading" && <ChevronDown
                                                                        size={15}
                                                                        className="ml-1 text-foreground transition-transform duration-300 group-data-[state=open]:rotate-180"
                                                                    />}
                                                                </Button>
                                                            </CollapsibleTrigger>

                                                            <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-200">
                                                                <div className="flex flex-col rounded-xl border border-zinc-100 dark:border-zinc-800 bg-background overflow-hidden shadow-sm max-w-[95%]">

                                                                    <div className="border-b dark:border-zinc-800">
                                                                        <div className="px-3 py-1.5 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                                                                            <Terminal size={10} className="text-blue-400" />
                                                                            <span className="text-[9px] font-medium text-muted-foreground uppercase">Arguments</span>
                                                                        </div>
                                                                        <div className="p-3 overflow-x-auto scrollbar-hide">
                                                                            <pre className="text-[10px] font-mono text-cyan-700 dark:text-cyan-500 whitespace-pre-wrap">
                                                                                {extractToolMessage(tool.query) || JSON.stringify(tool.query, null, 2)}
                                                                            </pre>
                                                                        </div>
                                                                    </div>

                                                                    {tool.result && (
                                                                        <div className="flex-1 overflow-hidden">
                                                                            <div className="px-3 py-1.5 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                                                                                <Cpu size={10} className="text-emerald-400" />
                                                                                <span className="text-[9px] font-medium text-muted-foreground uppercase">Execution</span>
                                                                            </div>
                                                                            <div className="p-3 max-h-62.5 overflow-y-auto scrollbar-thin" style={{ scrollbarWidth: "none" }}>
                                                                                <pre className="text-[10px] font-mono text-green-700 dark:text-green-500 whitespace-pre-wrap">
                                                                                    {typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result, null, 2)}
                                                                                </pre>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    ))}                                                </div>                                                </motion.div>
                                                <AiContent content={msg.content} />
                                            </div>
                                            {msg.content && (
                                                <button onClick={() => { navigator.clipboard.writeText(msg.content); store.setCopiedIndex_sheet(index); setTimeout(() => store.setCopiedIndex_sheet(null), 1500) }}
                                                    className={`${store.copiedIndex_sheet === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity p-1 rounded self-end -mt-1`}>
                                                    {store.copiedIndex_sheet === index ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </>)
                        : (
                            <div className="min-h-[50vh] flex flex-col gap-2 justify-center items-center">
                                <h1 className="text-3xl">GoogleSheet Agenting</h1>
                                <p className="text-sm text-muted-foreground">Send Message And Agent Will Handle Everything.</p>
                                <div className="flex gap-2">
                                    {!serviceemail && <Button className="bg-cyan-500 dark:bg-white" onClick={() => store.setOpenservice(true)}>Add Service</Button>}
                                </div>
                            </div>
                        ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    )
}
