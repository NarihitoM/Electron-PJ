import { googleauthstore } from "../store/store";
import { Server } from "@/shared/config/axioconfig";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { Toaster } from "@/shared/components/ui/sonner";
import { GoogleGmailHeader } from "./GoogleGmailHeader";
import { GoogleGmailMessageList } from "./GoogleGmailMessageList";
import { GoogleGmailInput } from "./GoogleGmailInput";

export const GoogleGmailChat = () => {
  const store = googleauthstore();

  const handleApprove = () => {
    if (store.pendingApprovalRef_gmail.current) {
      Server.post("/tool/approve", { thread_id: store.threadIdRef_gmail.current }).catch(() => {});
      store.pendingApprovalRef_gmail.current = null;
      store.setPendingApproval_gmail(null);
    }
  };

  const handleReject = () => {
    if (store.pendingApprovalRef_gmail.current) {
      const { name, query } = store.pendingApprovalRef_gmail.current;
      const fallbackId = `${name}-${Date.now()}`;
      store.updateSessionMessages_gmail((prev) => {
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
      Server.post("/tool/reject", { thread_id: store.threadIdRef_gmail.current }).catch(() => {});
      store.pendingApprovalRef_gmail.current = null;
      store.setPendingApproval_gmail(null);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <ToolApprovalDialog
        open={store.pendingApproval_gmail !== null}
        toolName={store.pendingApproval_gmail?.name || ""}
        toolQuery={store.pendingApproval_gmail?.query || null}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <div className="flex h-[92vh] w-full flex-col bg-background">
        <GoogleGmailHeader />
        <GoogleGmailMessageList />
        <GoogleGmailInput />
      </div>
      <ImageLightbox
        images={store.lightboxImages_gmail}
        initialIndex={store.lightboxIndex_gmail}
        open={store.lightboxOpen_gmail}
        onOpenChange={store.setLightboxOpen_gmail}
      />
    </>
  );
};
