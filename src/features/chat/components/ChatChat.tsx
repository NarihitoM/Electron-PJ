import { chatauthstore } from "../store/store"
import { Server } from "@/shared/config/axioconfig"
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog"
import { ImageLightbox } from "@/shared/components/ImageLightbox"
import { Toaster } from "@/shared/components/ui/sonner"
import { ChatHeader } from "./ChatHeader"
import { ServiceConnectionPanel } from "./ServiceConnectionPanel"
import { ChatMessageList } from "./ChatMessageList"
import { ChatInput } from "./ChatInput"
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys"

export const ChatChat = () => {
    const store = chatauthstore()
    const { data: Api = [] } = useServiceKeys()

    const handleApprove = () => {
        if (store.pendingApprovalRef.current) {
            Server.post("/tool/approve", { thread_id: store.threadIdRef.current }).catch(() => { })
            store.pendingApprovalRef.current = null
            store.setPendingApproval(null)
        }
    }

    const handleReject = () => {
        if (store.pendingApprovalRef.current) {
            const { name, query } = store.pendingApprovalRef.current
            const fallbackId = `${name}-${Date.now()}`
            store.updateSessionMessages(prev => {
                const ns = [...prev]
                const li = ns.length - 1
                if (ns[li]?.role !== "assistant") return prev
                const cm = { ...ns[li] }
                const tc = [...(cm.toolsCall || [])]
                tc.push({ id: fallbackId, name, query, status: "rejected" as const, result: "Tool execution rejected by user." as any })
                ns[li] = { ...cm, toolsCall: tc }
                return ns
            })
            Server.post("/tool/reject", { thread_id: store.threadIdRef.current }).catch(() => { })
            store.pendingApprovalRef.current = null
            store.setPendingApproval(null)
        }
    }

    return (
        <>
            <Toaster position="top-right" richColors />
            <ToolApprovalDialog
                open={store.pendingApproval !== null}
                toolName={store.pendingApproval?.name || ""}
                toolQuery={store.pendingApproval?.query || null}
                onApprove={handleApprove}
                onReject={handleReject}
            />
            <div className="flex h-[92vh] w-full flex-col bg-background">
                {Api.length > 0 ? (
                    <>
                        <ChatHeader />
                        <ChatMessageList />
                        <ChatInput />
                    </>
                ) : (
                    <div className="flex flex-col gap-4">
                        <ChatHeader />
                        <ServiceConnectionPanel />
                    </div>
                )}
            </div>
            <ImageLightbox
                images={store.lightboxImages}
                initialIndex={store.lightboxIndex}
                open={store.lightboxOpen}
                onOpenChange={store.setLightboxOpen}
            />
        </>
    )
}
