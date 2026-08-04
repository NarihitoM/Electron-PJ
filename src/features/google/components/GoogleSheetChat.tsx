import { googleauthstore } from "../store/store";
import { Server } from "@/shared/config/axioconfig";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { Toaster } from "@/shared/components/ui/sonner";
import { GoogleSheetHeader } from "./GoogleSheetHeader";
import { GoogleSheetConnectionPanel } from "./GoogleSheetConnectionPanel";
import { GoogleSheetMessageList } from "./GoogleSheetMessageList";
import { GoogleSheetInput } from "./GoogleSheetInput";

export const GoogleSheetChat = () => {
  const store = googleauthstore();

  const handleApprove = () => {
    if (store.pendingApprovalRef_sheet.current) {
      Server.post("/tool/approve", { thread_id: store.threadIdRef_sheet.current }).catch(() => {});
      store.pendingApprovalRef_sheet.current = null;
      store.setPendingApproval_sheet(null);
    }
  };

  const handleReject = () => {
    if (store.pendingApprovalRef_sheet.current) {
      const { name, query } = store.pendingApprovalRef_sheet.current;
      const fallbackId = `${name}-${Date.now()}`;
      store.updateSessionMessages_sheet((prev) => {
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
      Server.post("/tool/reject", { thread_id: store.threadIdRef_sheet.current }).catch(() => {});
      store.pendingApprovalRef_sheet.current = null;
      store.setPendingApproval_sheet(null);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <ToolApprovalDialog
        open={store.pendingApproval_sheet !== null}
        toolName={store.pendingApproval_sheet?.name || ""}
        toolQuery={store.pendingApproval_sheet?.query || null}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <div className="flex h-[92vh] w-full flex-col bg-background">
        <GoogleSheetHeader />
        <GoogleSheetMessageList />
        <GoogleSheetConnectionPanel />
        <GoogleSheetInput />
      </div>
      <ImageLightbox
        images={store.lightboxImages_sheet}
        initialIndex={store.lightboxIndex_sheet}
        open={store.lightboxOpen_sheet}
        onOpenChange={store.setLightboxOpen_sheet}
      />
    </>
  );
};
