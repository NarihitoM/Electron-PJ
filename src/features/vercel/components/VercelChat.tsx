import { Server } from "@/shared/config/axioconfig";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { Toaster } from "@/shared/components/ui/sonner";
import { vercelauthstore } from "../store/store";
import { VercelChatHeader } from "./VercelChatHeader";
import { VercelConnectionPanel } from "./VercelConnectionPanel";
import { VercelMessageList } from "./VercelMessageList";
import { VercelInput } from "./VercelInput";

export const VercelChat = () => {
  const store = vercelauthstore();

  const handleApprove = () => {
    if (store.pendingApprovalRef.current) {
      Server.post("/tool/approve", { thread_id: store.threadIdRef.current }).catch(() => {});
      store.pendingApprovalRef.current = null;
      store.setPendingApproval(null);
    }
  };

  const handleReject = () => {
    if (store.pendingApprovalRef.current) {
      const { name, query } = store.pendingApprovalRef.current;
      const fallbackId = `${name}-${Date.now()}`;
      store.updateSessionMessages((prev) => {
        const ns = [...prev];
        const li = ns.length - 1;
        if (ns[li]?.role !== "assistant") return prev;
        const cm = { ...ns[li] };
        const tc = [...(cm.toolsCall || [])];
        tc.push({
          id: fallbackId,
          name,
          query,
          status: "rejected" as const,
          result: "Tool execution rejected by user." as any,
        });
        ns[li] = { ...cm, toolsCall: tc };
        return ns;
      });
      Server.post("/tool/reject", { thread_id: store.threadIdRef.current }).catch(() => {});
      store.pendingApprovalRef.current = null;
      store.setPendingApproval(null);
    }
  };

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
      <VercelConnectionPanel />
      <div className="flex h-[92vh] w-full flex-col bg-background">
        <VercelChatHeader />
        <VercelMessageList />
        <VercelInput />
      </div>
      <ImageLightbox
        images={store.lightboxImages}
        initialIndex={store.lightboxIndex}
        open={store.lightboxOpen}
        onOpenChange={store.setLightboxOpen}
      />
    </>
  );
};
