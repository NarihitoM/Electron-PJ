import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { ArrowUp, ToolCaseIcon, X, Square, Mic, Box } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";

interface GoogleDocsInputProps {
    Api: Array<{ provider: string }>;
    provider: string;
    model: string;
    serviceemail: string;
    docs: Array<{ id: string; url: string; name: string }>;
    input: string;
    setInput: (value: string) => void;
    sending: boolean;
    loadingrecord: boolean;
    recordstatus: boolean;
    uploadingImages: boolean;
    pendingImages: File[];
    setPendingImages: (images: File[]) => void;
    type: string | null;
    settype: (type: string | null) => void;
    modelList: any[];
    modelsLoading: boolean;
    reasoningLevel: "" | "low" | "medium" | "high";
    setReasoningLevel: (level: "" | "low" | "medium" | "high") => void;
    setModel: (model: string) => void;
    handleSend: () => void;
    startRecording: () => void;
    stopRecording: () => void;
    abortControllerRef: React.RefObject<AbortController | null>;
}

export const GoogleDocsInput = ({
    Api,
    provider,
    model,
    serviceemail,
    docs,
    input,
    setInput,
    sending,
    loadingrecord,
    recordstatus,
    uploadingImages,
    pendingImages,
    setPendingImages,
    type,
    settype,
    modelList,
    modelsLoading,
    reasoningLevel,
    setReasoningLevel,
    setModel,
    handleSend,
    startRecording,
    stopRecording,
    abortControllerRef,
}: GoogleDocsInputProps) => {
    const [hover, setHover] = useState<boolean>(false);

    const isDisabled = Api.length === 0 || !provider || !model || !serviceemail || docs.length === 0 || loadingrecord || recordstatus || uploadingImages;

    const toolLabels: Record<string, string> = {
        read: "Read Docs Data",
        edit: "Edit Docs Data",
        delete: "Delete Docs File",
    };

    return (
        <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
            <ImagePreview
                images={pendingImages}
                onImagesChange={setPendingImages}
                uploading={uploadingImages}
            />
            <Textarea
                disabled={isDisabled}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={recordstatus ? "Listening..." : loadingrecord ? "Transcribing..." : "Message..."}
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
                        disabled={isDisabled}
                        maxImages={4}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="outline" className="flex gap-1 items-center cursor-pointer">
                                <ToolCaseIcon size={15} />
                                <span className="text-sm">Tools</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" side="top" className="w-40">
                            <DropdownMenuItem onClick={() => settype("read")}>
                                <Box /> Read Docs Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => settype("edit")}>
                                <Box /> Edit Docs Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => settype("delete")}>
                                <Box /> Delete Docs File
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => settype("create")}>
                                <Box /> Create Docs
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {type && type !== "text" && type !== "create" &&
                        <button
                            onClick={() => {
                                settype("text");
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
                                <Box size={17} className="text-blue-400" />
                            )}
                            <span className="text-[13px] text-blue-400">
                                {toolLabels[type] || type}
                            </span>
                        </button>}
                </div>
                <div className="flex gap-2">
                    {Api.length > 0 && (
                        <ModelSelect modelList={modelList} provider={provider || ""} model={model} loading={modelsLoading} disabled={!provider} onSelect={setModel} reasoningLevel={reasoningLevel} onReasoningLevelChange={setReasoningLevel} />
                    )}
                    <Button
                        disabled={loadingrecord || !serviceemail || docs.length === 0 || !model || !provider}
                        onClick={recordstatus ? stopRecording : startRecording}
                        size="icon"
                        className="bg-cyan-500 dark:bg-white rounded-full">
                        {recordstatus ? <Square size={14} className="fill-current" /> :
                            loadingrecord ? <Spinner /> : <Mic size={14} />}
                    </Button>
                    <Button
                        onClick={sending ? () => abortControllerRef.current?.abort() : handleSend}
                        disabled={!sending && (!serviceemail || !provider || !model || (!input.trim() && pendingImages.length === 0) || docs.length === 0 || loadingrecord || recordstatus || uploadingImages)}
                        size="icon"
                        className={sending ? "bg-red-500 hover:bg-red-600 rounded-full" : "bg-cyan-500 dark:bg-white rounded-full"}
                    >
                        {sending ? <Square size={16} className="fill-current" /> : <ArrowUp size={16} />}
                    </Button>
                </div>
            </div>
        </div>
    );
};
