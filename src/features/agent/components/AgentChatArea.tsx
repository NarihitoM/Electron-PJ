import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { BRAND_ASSETS } from "@/shared/config/providermodels";
import { agentsession } from "@/features/agent/types";
import { Bot, AlertTriangle, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import AiContent from "@/shared/components/layout/LayoutAiresponse";
import { nodes } from "@/shared/types/globaltype";

interface AgentChatAreaProps {
  history: agentsession[];
  nodes: nodes[];
  userdata: any;
  historyLoadingMore: boolean;
  historyError: boolean;
  historyHasMore: boolean;
  topSentinelRef: React.Ref<HTMLDivElement>;
  historyEndRef: React.Ref<HTMLDivElement>;
  scrollContainerRef: React.Ref<HTMLDivElement>;
  onRetryLoad: () => void;
  copiedIndex: number | null;
  setCopiedIndex: (index: number | null) => void;
}

export const AgentChatArea = ({
  history,
  nodes,
  userdata,
  historyLoadingMore,
  historyError,
  onRetryLoad,
  copiedIndex,
  setCopiedIndex,
  topSentinelRef,
  historyEndRef,
  scrollContainerRef,
}: AgentChatAreaProps) => {
  return (
    <div
      ref={scrollContainerRef}
      className="h-[calc(100vh-180px)] overflow-y-auto px-4 pb-4"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex flex-col gap-4">
        {historyError ? (
          <div className="flex flex-col gap-3 justify-center items-center py-10">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h2 className="text-lg font-semibold">Failed To Load</h2>
            <p className="text-sm text-muted-foreground">
              There was a problem connecting to the server.
            </p>
            <Button
              onClick={onRetryLoad}
              size="sm"
              className="bg-cyan-500 dark:bg-white"
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div ref={topSentinelRef} className="h-1" />
            {historyLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner className="h-5 w-5 text-cyan-500 dark:text-white" />
                  Loading...
                </div>
              </div>
            )}
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No history yet.
              </p>
            ) : (
              history.map((msg, index) => {
                const isUser = msg.role === "user";

                return (
                  <div
                    key={index}
                    className={`group mb-4 flex w-full gap-4 ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-1">
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
                      ) : (() => {
                        const node = nodes.find(n => n.name === msg.name);
                        const prov = msg.provider || node?.provider;
                        return prov && BRAND_ASSETS[prov] ? (
                          <img
                            src={BRAND_ASSETS[prov]}
                            className="w-7 h-7 rounded bg-white dark:bg-card"
                          />
                        ) : (
                          <Bot className="h-5 w-5 text-cyan-500 dark:text-white relative" />
                        );
                      })()}
                    </div>

                    <div
                      className={`flex flex-col gap-1 max-w-[85%] min-w-0 ${
                        isUser
                          ? "items-end text-right"
                          : "items-start text-left"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {isUser
                          ? userdata?.username
                          : msg.name || "Agent"}
                      </span>
                      {!isUser &&
                        (() => {
                          const node = nodes.find(
                            (n) => n.name === msg.name
                          );
                          const mdl = msg.model || node?.model;
                          return mdl ? (
                            <span className="text-[10px] font-mono text-muted-foreground/70">
                              {mdl}
                            </span>
                          ) : null;
                        })()}

                      <div
                        className={`py-2 rounded-2xl leading-relaxed text-[15px] whitespace-pre-wrap w-full overflow-hidden ${
                          isUser
                            ? "bg-muted text-foreground rounded-tr-none p-3"
                            : "bg-transparent text-foreground rounded-tl-none"
                        }`}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="wrap-break-word w-full"
                        >
                          <AiContent content={msg.content} />
                        </motion.div>
                      </div>
                      {msg.content && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedIndex(index);
                            setTimeout(
                              () => setCopiedIndex(null),
                              1500
                            );
                          }}
                          className={`${
                            copiedIndex === index
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          } transition-opacity p-1 rounded self-end -mt-1`}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={historyEndRef} />
          </>
        )}
      </div>
    </div>
  );
};
