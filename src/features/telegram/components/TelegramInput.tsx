import { ArrowUp, ToolCaseIcon, X, RefreshCw, Square, Mic, Timer, Box } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
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
import { Spinner } from "@/shared/components/ui/spinner";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import { TelegramCronScheduler } from "./TelegramCronScheduler";
import type { TelegramChatEntity, TelegramContactEntity, telegramcrondata } from "@/features/telegram/types";
import type { Servicefetch } from "@/features/services/types";

interface TelegramInputProps {
    input: string;
    setInput: (val: string) => void;
    sending: boolean;
    recordstatus: boolean;
    loadingrecord: boolean;
    telegramuserdata: boolean;
    provider: string;
    model: string;
    mode: string;
    type: string;
    settype: (val: string) => void;
    hover: boolean;
    setHover: (val: boolean) => void;
    Api: Servicefetch[];
    pendingImages: File[];
    setPendingImages: (images: File[]) => void;
    uploadingImages: boolean;
    loadingdeletemsg: boolean;
    sessionmessageLength: number;
    groups: TelegramChatEntity[];
    contacts: TelegramContactEntity[];
    selectedGroupId: string;
    selectedContactId: string;
    selectedGroupTitle: string;
    selectContactName: string;
    setmode: (val: string) => void;
    setSelectedGroupId: (val: string) => void;
    setSelectedContactId: (val: string) => void;
    handleSend: () => void;
    abortRef: React.MutableRefObject<AbortController | null>;
    startRecording: () => void;
    stopRecording: () => void;
    telegrammsgdelete: () => void;
    modelList: ModelEntry[];
    modelsLoading: boolean;
    setModel: (val: string) => void;
    reasoningLevel: "" | "low" | "medium" | "high";
    setReasoningLevel: (val: "" | "low" | "medium" | "high") => void;
    opencron: boolean;
    setopencron: (val: boolean) => void;
    telegramcron: telegramcrondata;
    settelegramcron: React.Dispatch<React.SetStateAction<telegramcrondata>>;
    loadingcroncreate: boolean;
    cronsubmint: () => void;
    cronModelList: ModelEntry[];
    setModelOpen: (val: boolean) => void;
    modelOpen: boolean;
    customDayOfWeek: number[];
    customDayOfMonth: number[];
    customMonth: number[];
    toggleCustomDayOfWeek: (day: number) => void;
    toggleCustomDayOfMonth: (day: number) => void;
    toggleCustomMonth: (month: number) => void;
    handlecronchange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    apiWithLogos: (Servicefetch & { imageUrl: string })[];
}

export const TelegramInput = ({
    input,
    setInput,
    sending,
    recordstatus,
    loadingrecord,
    telegramuserdata,
    provider,
    model,
    mode,
    type,
    settype,
    hover,
    setHover,
    Api,
    pendingImages,
    setPendingImages,
    uploadingImages,
    loadingdeletemsg,
    sessionmessageLength,
    groups,
    contacts,
    selectedGroupId,
    selectedContactId,
    selectedGroupTitle,
    selectContactName,
    setmode,
    setSelectedGroupId,
    setSelectedContactId,
    handleSend,
    abortRef,
    startRecording,
    stopRecording,
    telegrammsgdelete,
    modelList,
    modelsLoading,
    setModel,
    reasoningLevel,
    setReasoningLevel,
    opencron,
    setopencron,
    telegramcron,
    settelegramcron,
    loadingcroncreate,
    cronsubmint,
    cronModelList,
    setModelOpen,
    modelOpen,
    customDayOfWeek,
    customDayOfMonth,
    customMonth,
    toggleCustomDayOfWeek,
    toggleCustomDayOfMonth,
    toggleCustomMonth,
    handlecronchange,
    apiWithLogos,
}: TelegramInputProps) => {
    return (
        <>
            {/* Bottom action bar */}
            <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
                <div className="flex gap-2">
                    <Button onClick={telegrammsgdelete} disabled={sessionmessageLength === 0 || loadingdeletemsg} className="bg-cyan-500 dark:bg-white">{loadingdeletemsg ? <Spinner /> : <><RefreshCw />Reset Chat</>}</Button>
                    {telegramuserdata && (
                        <Button onClick={() => setopencron(true)} className="bg-cyan-500 dark:bg-white"><Timer />Schedule Message</Button>
                    )}
                </div>
                <div className="flex gap-2 items-center">
                    {telegramuserdata && (
                        <>
                            {groups.length > 0 && contacts.length > 0 &&
                                <Select key="mode"
                                    onValueChange={(val) => {
                                        setmode(val ?? "");
                                        setSelectedGroupId("");
                                        setSelectedContactId("");
                                    }}
                                    value={mode}
                                    disabled={!provider}>
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {mode ? mode : "Select Mode"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        <SelectItem value="group">Group</SelectItem>
                                        <SelectItem value="contact">Contact</SelectItem>
                                    </SelectContent>
                                </Select>
                            }
                            {mode === "group" && groups.length > 0 &&
                                <Select
                                    key={selectedGroupId}
                                    onValueChange={(val) => setSelectedGroupId(val ?? "")}
                                    value={selectedGroupId}
                                    disabled={!provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {selectedGroupId ? selectedGroupTitle?.substring(0, 15) + "..." : "Select Groups"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {groups.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>}
                            {mode === "contact" && contacts.length > 0 &&
                                <Select
                                    key={selectedContactId}
                                    onValueChange={(val) => setSelectedContactId(val ?? "")}
                                    value={selectedContactId}
                                    disabled={!provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {selectedContactId ? selectContactName?.substring(0, 15) + "..." : "Select Contacts"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {contacts.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            }
                        </>
                    )}
                </div>
            </div>

            {/* Input area */}
            <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
                <ImagePreview
                    images={pendingImages}
                    onImagesChange={setPendingImages}
                    uploading={uploadingImages}
                />
                <Textarea
                    value={input}
                    disabled={Api.length === 0 || !telegramuserdata || !model || !provider || loadingrecord || recordstatus}
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
                            disabled={Api.length === 0 || !telegramuserdata || !model || !provider || loadingrecord || recordstatus}
                            maxImages={4}
                        />

                        <TelegramCronScheduler
                            open={opencron}
                            onOpenChange={setopencron}
                            telegramcron={telegramcron}
                            settelegramcron={settelegramcron}
                            loadingcroncreate={loadingcroncreate}
                            cronsubmint={cronsubmint}
                            apiWithLogos={apiWithLogos}
                            cronModelList={cronModelList}
                            setModelOpen={setModelOpen}
                            modelOpen={modelOpen}
                            customDayOfWeek={customDayOfWeek}
                            customDayOfMonth={customDayOfMonth}
                            customMonth={customMonth}
                            toggleCustomDayOfWeek={toggleCustomDayOfWeek}
                            toggleCustomDayOfMonth={toggleCustomDayOfMonth}
                            toggleCustomMonth={toggleCustomMonth}
                            handlecronchange={handlecronchange}
                            telegramuserdata={telegramuserdata}
                            groups={groups}
                            contacts={contacts}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="outline" className="flex gap-1 items-center cursor-pointer">
                                    <ToolCaseIcon size={15} />
                                    <span className="text-sm">Tools</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" side="top" className="w-45">
                                <DropdownMenuItem onClick={() => settype("read")}>
                                    <Box /> Read Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("readusers")}>
                                    <Box /> Read Chat Members
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("send")}>
                                    <Box /> Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("getinfo")}>
                                    <Box /> Get info
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {type === "read" &&
                            <button
                                onClick={() => { settype(""); setHover(false); }}
                                disabled={sending}
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                            >
                                {hover ? <X size={17} className="text-blue-400" /> : <Box size={17} className="text-blue-400" />}
                                <span className="text-[13px] text-blue-400">Read Message</span>
                            </button>}
                        {type === "readusers" &&
                            <button
                                onClick={() => { settype(""); setHover(false); }}
                                disabled={sending}
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                            >
                                {hover ? <X size={17} className="text-blue-400" /> : <Box size={17} className="text-blue-400" />}
                                <span className="text-[13px] text-blue-400">Read Chat Members</span>
                            </button>}
                        {type === "send" &&
                            <button
                                onClick={() => { settype(""); setHover(false); }}
                                disabled={sending}
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                            >
                                {hover ? <X size={17} className="text-blue-400" /> : <Box size={17} className="text-blue-400" />}
                                <span className="text-[13px] text-blue-400">Send Message</span>
                            </button>}
                        {type === "getinfo" &&
                            <button
                                onClick={() => { settype(""); setHover(false); }}
                                disabled={sending}
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                            >
                                {hover ? <X size={17} className="text-blue-400" /> : <Box size={17} className="text-blue-400" />}
                                <span className="text-[13px] text-blue-400">Get info</span>
                            </button>}
                    </div>
                    <div className="flex gap-2">
                        {Api.length > 0 && (
                            <ModelSelect modelList={modelList} provider={provider || ""} model={model} loading={modelsLoading} disabled={!provider} onSelect={setModel} reasoningLevel={reasoningLevel} onReasoningLevelChange={setReasoningLevel} />
                        )}
                        <Button
                            disabled={loadingrecord || !telegramuserdata || !model || !provider}
                            onClick={recordstatus ? stopRecording : startRecording}
                            size="icon"
                            className="bg-cyan-500 dark:bg-white rounded-full">
                            {recordstatus ? <Square size={14} className="fill-current" /> :
                                loadingrecord ? <Spinner /> : <Mic size={14} />}
                        </Button>
                        <Button
                            onClick={sending ? () => abortRef.current?.abort() : handleSend}
                            disabled={!sending && (uploadingImages || !telegramuserdata || (!input.trim() && pendingImages.length === 0) || !model || !provider || loadingrecord || recordstatus)}
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
