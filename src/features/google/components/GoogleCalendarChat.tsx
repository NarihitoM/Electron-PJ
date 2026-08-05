import { googleauthstore } from "../store/store";
import { Server } from "@/shared/config/axioconfig";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { Toaster } from "@/shared/components/ui/sonner";
import { GoogleCalendarHeader } from "./GoogleCalendarHeader";
import { GoogleCalendarMessageList } from "./GoogleCalendarMessageList";
import { GoogleCalendarInput } from "./GoogleCalendarInput";

export const GoogleCalendarChat = () => {
  const store = googleauthstore();

  const handleApprove = () => {
    if (store.pendingApprovalRef_calendar.current) {
      Server.post("/tool/approve", { thread_id: store.threadIdRef_calendar.current }).catch(
        () => {},
      );
      store.pendingApprovalRef_calendar.current = null;
      store.setPendingApproval_calendar(null);
    }
  };

  const handleReject = () => {
    if (store.pendingApprovalRef_calendar.current) {
      const { name, query } = store.pendingApprovalRef_calendar.current;
      const fallbackId = `${name}-${Date.now()}`;
      store.updateSessionMessages_calendar((prev) => {
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
      Server.post("/tool/reject", { thread_id: store.threadIdRef_calendar.current }).catch(
        () => {},
      );
      store.pendingApprovalRef_calendar.current = null;
      store.setPendingApproval_calendar(null);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <ToolApprovalDialog
        open={store.pendingApproval_calendar !== null}
        toolName={store.pendingApproval_calendar?.name || ""}
        toolQuery={store.pendingApproval_calendar?.query || null}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <div className="flex h-[92vh] w-full flex-col bg-background">
        <GoogleCalendarHeader />
        <GoogleCalendarMessageList />
        <GoogleCalendarInput />
      </div>
      <ImageLightbox
        images={store.lightboxImages_calendar}
        initialIndex={store.lightboxIndex_calendar}
        open={store.lightboxOpen_calendar}
        onOpenChange={store.setLightboxOpen_calendar}
      />
    </>
  );
};
