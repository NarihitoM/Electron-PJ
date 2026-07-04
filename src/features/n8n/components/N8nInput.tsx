import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { Box, RefreshCw, Square, Mic, X, ArrowUp } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import type { chatsession } from "@/shared/types/globaltype";
import type { ModelEntry } from "@/shared/lib/modelsapi";

interface N8nInputProps {
    connected: boolean;
    model: string;
    provider: string;
    input: string;
    setInput: (v: string) => void;
    sending: boolean;
    recordstatus: boolean;
    loadingrecord: boolean;
    pendingImages: File[];
    setPendingImages: (files: File[]) => void;
    uploadingImages: boolean;
    type: string | null;
    settype: (t: string | null) => void;
    hover: boolean;
    setHover: (h: boolean) => void;
    handleSend: () => void;
    startRecording: () => void;
    stopRecording: () => void;
    deletemessages: () => void;
    loadingn8nmsg: boolean;
    sessionmessage: chatsession[];
    modelList: ModelEntry[];
    modelsLoading: boolean;
    reasoningLevel: "" | "low" | "medium" | "high";
    setReasoningLevel: (level: "" | "low" | "medium" | "high") => void;
    Api: any[];
    setModel: (model: string) => void;
    abortControllerRef: React.MutableRefObject<AbortController | null>;
}

export const N8nInput = ({
    connected,
    model,
    provider,
    input,
    setInput,
    sending,
    recordstatus,
    loadingrecord,
    pendingImages,
    setPendingImages,
    uploadingImages,
    type,
    settype,
    hover,
    setHover,
    handleSend,
    startRecording,
    stopRecording,
    deletemessages,
    loadingn8nmsg,
    sessionmessage,
    modelList,
    modelsLoading,
    reasoningLevel,
    setReasoningLevel,
    Api,
    setModel,
    abortControllerRef,
}: N8nInputProps) => {
    return (
        <>
            <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
                <Button onClick={deletemessages} disabled={sessionmessage.length === 0 || loadingn8nmsg} className="bg-cyan-500 dark:bg-white">{loadingn8nmsg ? <Spinner /> : <><RefreshCw />Reset Chat</>}</Button>
                <div className="flex gap-2 items-center">
                    {connected && (
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="outline" className="flex gap-1 items-center cursor-pointer">
                                    <Box size={15} />
                                    <span className="text-sm">Tools</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" side="top" className="w-40">
                                <DropdownMenuItem onClick={() => settype("text")}>
                                    <Box /> General Chat
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("create")}>
                                    <Box /> Create Workflow
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("list")}>
                                    <Box /> List Workflows
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("trigger")}>
                                    <Box /> Trigger Workflow
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("executions")}>
                                    <Box /> View Executions
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {type !== "text" &&
                        <button
                            onClick={() => { settype("text"); setHover(false); }}
                            disabled={sending}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                        >
                            {hover ? <X size={17} className="text-blue-400" /> : <Box size={17} className="text-blue-400" />}
                            <span className="text-[13px] text-blue-400">{type === "create" ? "Create Workflow" : type === "list" ? "List Workflows" : type === "trigger" ? "Trigger Workflow" : "View Executions"}</span>
                        </button>
                    }
                </div>
            </div>
            <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
                <ImagePreview
                    images={pendingImages}
                    onImagesChange={setPendingImages}
                    uploading={uploadingImages}
                />
                <Textarea
                    disabled={!connected || !model || !provider || loadingrecord || recordstatus}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={recordstatus ? "Listening..." : loadingrecord ? "Transcribing..." : !connected ? "Connect n8n first..." : "Message..."}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    className="border-none max-h-50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                />
                <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2 items-center">
                        <ImagePicker
                            images={pendingImages}
                            onImagesChange={setPendingImages}
                            uploading={uploadingImages}
                            disabled={!connected || !model || !provider || loadingrecord || recordstatus}
                            maxImages={4}
                        />
                        {type !== "text" && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full border bg-cyan-500/5 border-cyan-500/20 text-[12px] text-blue-400">
                                {type === "create" ? "Create Workflow" : type === "list" ? "List Workflows" : type === "trigger" ? "Trigger Workflow" : "View Executions"}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {Api.length > 0 && (
                            <ModelSelect modelList={modelList} provider={provider || ""} model={model} loading={modelsLoading} disabled={!provider} onSelect={setModel} reasoningLevel={reasoningLevel} onReasoningLevelChange={setReasoningLevel} />
                        )}
                        <Button
                            disabled={loadingrecord || !connected || !model || !provider}
                            onClick={recordstatus ? stopRecording : startRecording}
                            size="icon"
                            className="bg-cyan-500 dark:bg-white rounded-full">
                            {recordstatus ? <Square size={14} className="fill-current" /> :
                                loadingrecord ? <Spinner /> : <Mic size={14} />}
                        </Button>
                        <Button
                            onClick={sending ? () => abortControllerRef.current?.abort() : handleSend}
                            disabled={!sending && (uploadingImages || !connected || (!input.trim() && pendingImages.length === 0) || !model || !provider || loadingrecord || recordstatus)}
                            size="icon"
                            className={sending ? "bg-red-500 hover:bg-red-600 rounded-full" : "bg-cyan-500 dark:bg-white rounded-full"}
                        >
                            {sending ? <Square size={16} className="fill-current" /> : <ArrowUp size={16} />}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
