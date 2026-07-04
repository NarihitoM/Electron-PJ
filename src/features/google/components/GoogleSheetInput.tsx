import { ArrowUp, Mic, Square, Box, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";
import type { ModelEntry } from "@/shared/lib/modelsapi";

interface GoogleSheetInputProps {
    Api: Array<{ provider: string }>;
    provider: string;
    model: string;
    modelList: ModelEntry[];
    modelsLoading: boolean;
    reasoningLevel: "" | "low" | "medium" | "high";
    setReasoningLevel: (level: "" | "low" | "medium" | "high") => void;
    setModel: (model: string) => void;
    serviceemail: string;
    sheet: Array<{ url: string }>;
    input: string;
    setInput: (input: string) => void;
    type: string | null;
    settype: (type: string | null) => void;
    hover: boolean;
    setHover: (hover: boolean) => void;
    sending: boolean;
    recordstatus: boolean;
    loadingrecord: boolean;
    uploadingImages: boolean;
    pendingImages: File[];
    setPendingImages: (images: File[]) => void;
    startRecording: () => void;
    stopRecording: () => void;
    handleSend: () => void;
    abortControllerRef: React.RefObject<AbortController | null>;
}

export const GoogleSheetInput = ({
    Api,
    provider,
    model,
    modelList,
    modelsLoading,
    reasoningLevel,
    setReasoningLevel,
    setModel,
    serviceemail,
    sheet,
    input,
    setInput,
    type,
    settype,
    hover,
    setHover,
    sending,
    recordstatus,
    loadingrecord,
    uploadingImages,
    pendingImages,
    setPendingImages,
    startRecording,
    stopRecording,
    handleSend,
    abortControllerRef,
}: GoogleSheetInputProps) => {
    const isDisabled = Api.length === 0 || !provider || !model || !serviceemail || sheet.length === 0 || loadingrecord || recordstatus || uploadingImages;

    const renderTypeBadge = () => {
        const labels: Record<string, string> = {
            read: "Read Sheet Data",
            edit: "Edit Sheet Data",
            append: "Append Sheet Data",
            delete: "Delete Sheet Data",
        };
        if (!type || !labels[type]) return null;
        return (
            <button
                onClick={() => { settype("text"); setHover(false); }}
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
                    {labels[type]}
                </span>
            </button>
        );
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
                                <span className="text-sm">Tools</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" side="top" className="w-45">
                            <DropdownMenuItem onClick={() => settype("read")}>
                                <Box /> Read Sheet Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => settype("edit")}>
                                <Box /> Edit Sheet Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => settype("delete")}>
                                <Box /> Delete Sheet Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => settype("append")}>
                                <Box /> Append Sheet Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => settype("create")}>
                                <Box /> Create Sheet
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => settype("addsheet")}>
                                <Box /> Add Sheet Tab
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {renderTypeBadge()}
                </div>
                <div className="flex gap-2">
                    {Api.length > 0 && (
                        <ModelSelect modelList={modelList} provider={provider || ""} model={model} loading={modelsLoading} disabled={!provider} onSelect={setModel} reasoningLevel={reasoningLevel} onReasoningLevelChange={setReasoningLevel} />
                    )}
                    <Button
                        disabled={loadingrecord || !serviceemail || sheet.length === 0 || !model || !provider}
                        onClick={recordstatus ? stopRecording : startRecording}
                        size="icon"
                        className="bg-cyan-500 dark:bg-white rounded-full">
                        {recordstatus ? <Square size={14} className="fill-current" /> :
                            loadingrecord ? <Spinner /> : <Mic size={14} />}
                    </Button>
                    <Button
                        onClick={sending ? () => abortControllerRef.current?.abort() : handleSend}
                        disabled={!sending && (!provider || !model || (!input.trim() && pendingImages.length === 0) || sheet.length === 0 || loadingrecord || recordstatus || uploadingImages)}
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
