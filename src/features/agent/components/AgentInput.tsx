import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { ArrowUp, Mic, Square, Settings, BotIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";

interface AgentInputProps {
  input: string;
  setInput: (value: string) => void;
  nodes: any[];
  Node: any[];
  messageloading: boolean;
  loadingrecord: boolean;
  recordstatus: boolean;
  workflowloading: boolean;
  type: string;
  setType: (value: string) => void;
  selectnode: string | null;
  setSelectnode: (value: string) => void;
  firstnode: string | null;
  setFirstnode: (value: string) => void;
  lastnode: string | null;
  setLastnode: (value: string) => void;
  servicesOpen: boolean;
  setServicesOpen: (open: boolean) => void;
  servicesContent: React.ReactNode;
  historyContent: React.ReactNode;
  historyLength: number;
  loadingresetmsg: boolean;
  onResetHistory: () => void;
  onSendMessage: () => void;
  onAbortWorkflow: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const AgentInput = ({
  input,
  setInput,
  nodes,
  Node,
  messageloading,
  loadingrecord,
  recordstatus,
  workflowloading,
  type,
  setType,
  selectnode,
  setSelectnode,
  firstnode,
  setFirstnode,
  lastnode,
  setLastnode,
  servicesOpen,
  setServicesOpen,
  servicesContent,
  historyContent,
  historyLength,
  loadingresetmsg,
  onResetHistory,
  onSendMessage,
  onAbortWorkflow,
  onStartRecording,
  onStopRecording,
}: AgentInputProps) => {
  return (
    <div className="w-full mx-auto max-w-5xl">
      <div className="flex items-center justify-end gap-2 mb-2 flex-wrap px-1">
        <Select onValueChange={(val) => setType(val ?? "")} value={type}>
          <SelectTrigger className="w-40">
            <span className="truncate">{type ? type.substring(0, 15) + "..." : "Select Mode"}</span>
          </SelectTrigger>
          <SelectContent side="top" align="end" className="p-1 w-60">
            <SelectItem value="Linear Sequence">Linear Sequence</SelectItem>
            <SelectItem value="Specific Node">Specific Node</SelectItem>
            <SelectItem value="Range Node">Range Node</SelectItem>
            <SelectItem value="Simultaneous">Simultaneous</SelectItem>
          </SelectContent>
        </Select>
        {type === "Specific Node" && (
          <Select onValueChange={(val) => val && setSelectnode(val)} value={selectnode ?? ""} disabled={!type}>
            <SelectTrigger className="w-44">
              <span className="truncate">{selectnode ? selectnode.substring(0, 15) + "..." : "Select Agent Node"}</span>
            </SelectTrigger>
            <SelectContent className="p-1 w-60">
              {Node.map((n: any) => <SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {type === "Range Node" && (
          nodes.length > 1 ? (
            <div className="flex gap-2">
              <Select onValueChange={(val) => val && setFirstnode(val)} value={firstnode ?? ""} disabled={!type}>
                <SelectTrigger className="w-44">
                  <span className="truncate">{firstnode ? firstnode.substring(0, 15) + "..." : "First Node"}</span>
                </SelectTrigger>
                <SelectContent className="p-1 w-60">
                  {Node.map((n: any) => <SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={(val) => val && setLastnode(val)} value={lastnode ?? ""} disabled={!type}>
                <SelectTrigger className="w-44">
                  <span className="truncate">{lastnode ? lastnode.substring(0, 15) + "..." : "Last Node"}</span>
                </SelectTrigger>
                <SelectContent className="p-1 w-60">
                  {Node.map((n: any) => <SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <span className="text-sm text-red-400">Add at least two nodes.</span>
          )
        )}
      </div>
      <div className="bg-card rounded-2xl border p-3 shadow-lg">
        <div className="relative flex flex-col">
          <Textarea
            disabled={
              nodes.length === 0 ||
              messageloading ||
              loadingrecord ||
              recordstatus
            }
            value={input}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !messageloading) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              recordstatus
                ? "Listening..."
                : loadingrecord
                ? "Transcribing..."
                : "Message..."
            }
            className="border-none max-h-50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />

          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-2">
              <Sheet open={servicesOpen} onOpenChange={setServicesOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    className="bg-cyan-500 dark:bg-white rounded-full"
                  >
                    <Settings size={14} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-100 sm:w-135">
                  <SheetHeader>
                    <SheetTitle>Services</SheetTitle>
                    <SheetDescription>
                      Configure external services for your MultiAgents.
                    </SheetDescription>
                  </SheetHeader>
                  {servicesContent}
                </SheetContent>
              </Sheet>
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="bg-cyan-500 dark:bg-white rounded-full">
                    History
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>
                      <div className="flex items-center gap-2">
                        Chat History
                        <Button
                          onClick={onResetHistory}
                          disabled={historyLength === 0 || loadingresetmsg}
                          size="sm"
                          variant="destructive"
                          className="h-6 text-xs px-2"
                        >
                          {loadingresetmsg ? <Spinner /> : "Reset"}
                        </Button>
                      </div>
                    </SheetTitle>
                    <SheetDescription>
                      View your previous interactions with the agents.
                    </SheetDescription>
                  </SheetHeader>
                  {historyContent}
                </SheetContent>
              </Sheet>
              {type === "Specific Node" && selectnode && (
                <div className="inline-flex gap-2 items-center p-1.5 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20">
                  <span className="text-sm flex items-center gap-2">
                    {selectnode}
                    <BotIcon size={18} />
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end items-center">
              <Button
                disabled={loadingrecord || nodes.length === 0}
                onClick={recordstatus ? onStopRecording : onStartRecording}
                size="icon"
                className="bg-cyan-500 dark:bg-white rounded-full"
              >
                {recordstatus ? (
                  <Square size={14} className="fill-current" />
                ) : loadingrecord ? (
                  <Spinner />
                ) : (
                  <Mic size={14} />
                )}
              </Button>
              <Button
                onClick={workflowloading ? onAbortWorkflow : onSendMessage}
                size="icon"
                disabled={
                  !workflowloading &&
                  (!type ||
                    !input ||
                    nodes.length === 0 ||
                    messageloading ||
                    loadingrecord ||
                    recordstatus)
                }
                className={
                  workflowloading
                    ? "bg-red-500 hover:bg-red-600 rounded-full"
                    : "bg-cyan-500 dark:bg-white rounded-full"
                }
              >
                {workflowloading ? (
                  <Square size={16} className="fill-current" />
                ) : (
                  <ArrowUp size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
