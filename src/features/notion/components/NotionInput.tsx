import { useState } from "react";
import { ArrowUp, Box, Mic, Square, ToolCaseIcon, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/shared/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { RefreshCw } from "lucide-react";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import type { ModelEntry } from "@/shared/lib/modelsapi";

interface NotionInputProps {
    input: string;
    setInput: (value: string) => void;
    sending: boolean;
    recordstatus: boolean;
    loadingrecord: boolean;
    workspacename: string;
    model: string;
    provider: string;
    Api: any[];
    pages: { id: string; title: string }[];
    pageid: string | null;
    setPageid: (value: string | null) => void;
    type: string | null;
    settype: (value: string | null) => void;
    loadingnotion: boolean;
    loadingnotionmsg: boolean;
    pendingImages: File[];
    setPendingImages: (images: File[]) => void;
    uploadingImages: boolean;
    sessionmessage: any[];
    modelList: ModelEntry[];
    modelsLoading: boolean;
    reasoningLevel: "" | "low" | "medium" | "high";
    setReasoningLevel: (value: "" | "low" | "medium" | "high") => void;
    setModel: (value: string) => void;
    handleSend: () => void;
    startRecording: () => void;
    stopRecording: () => void;
    deletenotionmsg: () => void;
    abortControllerRef: React.RefObject<AbortController | null>;
    selectedPagename: string;
}

export const NotionInput = ({
    input,
    setInput,
    sending,
    recordstatus,
    loadingrecord,
    workspacename,
    model,
    provider,
    Api,
    pages,
    pageid,
    setPageid,
    type,
    settype,
    loadingnotion,
    loadingnotionmsg,
    pendingImages,
    setPendingImages,
    uploadingImages,
    sessionmessage,
    modelList,
    modelsLoading,
    reasoningLevel,
    setReasoningLevel,
    setModel,
    handleSend,
    startRecording,
    stopRecording,
    deletenotionmsg,
    abortControllerRef,
    selectedPagename,
}: NotionInputProps) => {
    const [hover, setHover] = useState(false);

    const renderTypeButton = (label: string) => (
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
                {label}
            </span>
        </button>
    );

    return (
        <>
            <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
                <Button onClick={deletenotionmsg} disabled={sessionmessage.length === 0 || loadingnotionmsg} className="bg-cyan-500 dark:bg-white">{loadingnotionmsg ? <Spinner /> : <><RefreshCw />Reset Chat</>}</Button>
                <div className="flex gap-2 items-center">
                    {workspacename && (
                        <>
                            {pages.length > 0 && (
                                <Select
                                    value={pageid}
                                    onValueChange={(value) => setPageid(value)}
                                    key={`${provider}-${type}`}
                                    disabled={!provider || loadingnotion}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {pageid ? selectedPagename.substring(0, 15) + "..." : "Select Pages"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60">
                                        {pages.map((m: any) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
                <ImagePreview
                    images={pendingImages}
                    onImagesChange={setPendingImages}
                    uploading={uploadingImages}
                />
                <Textarea
                    disabled={Api.length === 0 || !workspacename || !model || !provider || loadingrecord || recordstatus}
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
                            disabled={Api.length === 0 || !workspacename || !model || !provider || loadingrecord || recordstatus}
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
                                    <Box /> Read Data
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("edit")}>
                                    <Box /> Edit Data
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("createsubpage")}>
                                    <Box />  Create Subpage
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("updatetitle")}>
                                    <Box /> Update Title
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("database")}>
                                    <Box />  Database
                                </DropdownMenuItem>

                            </DropdownMenuContent>
                        </DropdownMenu>
                        {type === "read" && renderTypeButton("Read Data")}
                        {type === "edit" && renderTypeButton("Edit Data")}
                        {type === "createsubpage" && renderTypeButton("Create Subpage")}
                        {type === "updatetitle" && renderTypeButton("Update Title")}
                    </div>
                    <div className="flex gap-2">
                        {Api.length > 0 && (
                            <ModelSelect modelList={modelList} provider={provider || ""} model={model} loading={modelsLoading} disabled={!provider} onSelect={setModel} reasoningLevel={reasoningLevel} onReasoningLevelChange={setReasoningLevel} />
                        )}
                        <Button
                            disabled={loadingrecord || !workspacename || !model || !provider}
                            onClick={recordstatus ? stopRecording : startRecording}
                            size="icon"
                            className="bg-cyan-500 dark:bg-white rounded-full">
                            {recordstatus ? <Square size={14} className="fill-current" /> :
                                loadingrecord ? <Spinner /> : <Mic size={14} />}
                        </Button>
                        <Button
                            onClick={sending ? () => abortControllerRef.current?.abort() : handleSend}
                            disabled={!sending && (uploadingImages || !workspacename || (!input.trim() && pendingImages.length === 0) || !model || !provider || loadingrecord || recordstatus)}
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
