import { Toaster } from "@/shared/components/ui/sonner";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { Server } from "@/shared/config/axioconfig";
import { discordauthstore } from "../store/store";
import { DiscordChatHeader } from "./DiscordChatHeader";
import { DiscordMessageList } from "./DiscordMessageList";
import { DiscordInput } from "./DiscordInput";

export const DiscordChat = () => {
  const {
    pendingApproval,
    setPendingApproval,
    pendingApprovalRef,
    threadIdRef,
    setsessionmessage,
    lightboxImages,
    lightboxIndex,
    lightboxOpen,
    setLightboxOpen,
  } = discordauthstore();

  const handleApprove = () => {
    if (pendingApprovalRef.current) {
      Server.post("/tool/approve", { thread_id: threadIdRef.current }).catch(() => {});
      pendingApprovalRef.current = null;
      setPendingApproval(null);
    }
  };

  const handleReject = () => {
    if (pendingApprovalRef.current) {
      const { name, query } = pendingApprovalRef.current;
      const fallbackId = `${name}-${Date.now()}`;
      setsessionmessage((prev) => {
        const newSession = [...prev];
        const lastIndex = newSession.length - 1;
        if (newSession[lastIndex]?.role !== "assistant") return prev;
        const currentMessage = { ...newSession[lastIndex] };
        const toolCalls = [...(currentMessage.toolsCall || [])];
        toolCalls.push({
          id: fallbackId,
          name,
          query,
          status: "rejected",
          result: "Tool execution rejected by user.",
        });
        newSession[lastIndex] = { ...currentMessage, toolsCall: toolCalls };
        return newSession;
      });
      Server.post("/tool/reject", { thread_id: threadIdRef.current }).catch(() => {});
      pendingApprovalRef.current = null;
      setPendingApproval(null);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <ToolApprovalDialog
        open={pendingApproval !== null}
        toolName={pendingApproval?.name || ""}
        toolQuery={pendingApproval?.query || null}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <div className="flex h-[92vh] w-full flex-col bg-background">
        <DiscordChatHeader />
        <DiscordMessageList />
        <DiscordInput />
      </div>
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
};
