import { useState } from "react";
import { ArrowUp, ToolCaseIcon, Globe, X, Mic, Square } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { Spinner } from "@/shared/components/ui/spinner";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import type { ModelEntry } from "@/shared/lib/modelsapi";

type ReasoningLevel = "" | "low" | "medium" | "high";

interface ChatInputProps {
    input: string;
    onInputChange: (value: string) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    disabled: boolean;
    sending: boolean;
    onStopSend: () => void;
    recordstatus: boolean;
    loadingrecord: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    pendingImages: File[];
    onSetPendingImages: (images: File[]) => void;
    uploadingImages: boolean;
    type: string | null;
    onSetType: (type: string) => void;
    modelList: ModelEntry[];
    provider: string;
    model: string | null;
    modelsLoading: boolean;
    onSelectModel: (model: string) => void;
    reasoningLevel?: ReasoningLevel;
    onReasoningLevelChange?: (level: ReasoningLevel) => void;
    apiLength: number;
}

export function ChatInput({
    input,
    onInputChange,
    onSend,
    onKeyDown,
    disabled,
    sending,
    onStopSend,
    recordstatus,
    loadingrecord,
    onStartRecording,
    onStopRecording,
    pendingImages,
    onSetPendingImages,
    uploadingImages,
    type,
    onSetType,
    modelList,
    provider,
    model,
    modelsLoading,
    onSelectModel,
    reasoningLevel,
    onReasoningLevelChange,
    apiLength,
}: ChatInputProps) {
    const [hover, setHover] = useState(false);

    return (
        <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
            <ImagePreview
                images={pendingImages}
                onImagesChange={onSetPendingImages}
                uploading={uploadingImages}
            />
            <Textarea
                disabled={disabled}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={recordstatus ? "Listening..." : loadingrecord ? "Transcribing..." : "Message..."}
                onKeyDown={onKeyDown}
                className="border-none max-h-50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            />

            <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2 items-center">
                    <ImagePicker
                        images={pendingImages}
                        onImagesChange={onSetPendingImages}
                        uploading={uploadingImages}
                        disabled={disabled}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="outline" className="flex gap-1 items-center cursor-pointer">
                                <ToolCaseIcon size={15} />
                                <span className="text-sm">Tools</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" side="top">
                            <DropdownMenuItem onClick={() => onSetType("websearch")}>
                                <Globe /> Web search
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSetType("webscrape")}>
                                <Globe /> Web Scrape
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {type === "websearch" &&
                        <button
                            onClick={() => {
                                onSetType("text");
                                setHover(false);
                            }}
                            disabled={sending}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                        >
                            {hover ? (
                                <X size={17} className="text-blue-400" />
                            ) : (
                                <Globe size={17} className="text-blue-400" />
                            )}
                            <span className="text-[13px] text-blue-400">
                                Search
                            </span>
                        </button>}
                    {type === "webscrape" &&
                        <button
                            onClick={() => {
                                onSetType("text");
                                setHover(false);
                            }}
                            disabled={sending}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                        >
                            {hover ? (
                                <X size={17} className="text-blue-400" />
                            ) : (
                                <Globe size={17} className="text-blue-400" />
                            )}
                            <span className="text-[13px] text-blue-400">
                                Scrape
                            </span>
                        </button>}
                </div>
                <div className="flex gap-2">
                    {apiLength > 0 && (
                        <ModelSelect
                            modelList={modelList}
                            provider={provider || ""}
                            model={model ?? ""}
                            loading={modelsLoading}
                            disabled={!provider}
                            onSelect={onSelectModel}
                            reasoningLevel={reasoningLevel}
                            onReasoningLevelChange={onReasoningLevelChange}
                        />
                    )}
                    <Button
                        disabled={loadingrecord || !model || !provider}
                        onClick={recordstatus ? onStopRecording : onStartRecording}
                        size="icon"
                        className="bg-cyan-500 dark:bg-white rounded-full">
                        {recordstatus ? <Square size={14} className="fill-current" /> :
                            loadingrecord ? <Spinner /> : <Mic size={14} />}
                    </Button>
                    <Button
                        onClick={sending ? onStopSend : onSend}
                        disabled={!sending && ((!input.trim() && pendingImages.length === 0) || uploadingImages || !model || !provider || loadingrecord || recordstatus)}
                        size="icon"
                        className={sending ? "bg-red-500 hover:bg-red-600 rounded-full" : "bg-cyan-500 dark:bg-white rounded-full"}
                    >
                        {sending ? <Square size={16} className="fill-current" /> : <ArrowUp size={16} />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
