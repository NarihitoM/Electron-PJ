import React, { RefObject } from "react";
import { ArrowUp, Box, Mic, RefreshCw, Square, Timer, ToolCaseIcon, X } from "lucide-react";
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
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { SlackCronScheduler } from "./SlackCronScheduler";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import type { slackcrondata } from "@/features/slack/types";
import type { chatsession } from "@/shared/types/globaltype";
import type { NavigateFunction } from "react-router-dom";
import type { Servicefetch } from "@/features/services/types";

interface Channel {
    id: string;
    name: string;
    [key: string]: unknown;
}

interface SlackInputProps {
    sessionmessage: chatsession[];
    pendingImages: File[];
    setPendingImages: React.Dispatch<React.SetStateAction<File[]>>;
    uploadingImages: boolean;
    input: string;
    setInput: (value: string) => void;
    Api: Servicefetch[];
    workspace: string;
    model: string;
    provider: string;
    loadingrecord: boolean;
    recordstatus: boolean;
    handleSend: () => void;
    sending: boolean;
    abortControllerRef: RefObject<AbortController | null>;
    startRecording: () => void;
    stopRecording: () => void;
    type: string | null;
    settype: (type: string | null) => void;
    hover: boolean;
    setHover: (hover: boolean) => void;
    opencron: boolean;
    setopencron: (open: boolean) => void;
    modelList: ModelEntry[];
    modelsLoading: boolean;
    setModel: (model: string) => void;
    reasoningLevel: "" | "low" | "medium" | "high";
    setReasoningLevel: (level: "" | "low" | "medium" | "high") => void;
    publichannel: Channel[];
    privatechannel: Channel[];
    im: Channel[];
    mpim: Channel[];
    mode: string;
    setmode: (mode: string) => void;
    channelid: string | null;
    setchannelid: (id: string | null) => void;
    selectedPublicchannel: string;
    selectedPrivatechannel: string;
    selectedimchannel: string;
    selectedmpimchannel: string;
    deleteslackmessage: () => void;
    loadingslackdelmsg: boolean;
    loadingcroncreate: boolean;
    cronsubmint: () => void;
    slackcron: slackcrondata;
    setslackcron: React.Dispatch<React.SetStateAction<slackcrondata>>;
    handlechange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    apiWithLogos: (Servicefetch & { imageUrl: string })[];
    navigate: NavigateFunction;
    cronModelList: ModelEntry[];
    modelOpen: boolean;
    setModelOpen: (open: boolean) => void;
    customDayOfWeek: number[];
    customDayOfMonth: number[];
    customMonth: number[];
    toggleCustomDayOfWeek: (day: number) => void;
    toggleCustomDayOfMonth: (day: number) => void;
    toggleCustomMonth: (month: number) => void;
    DAY_NAMES: string[];
    MONTH_NAMES: string[];
    maxDayOfMonth: number;
    selectedPublicchannelcron: string;
    selectedPrivatechannelcron: string;
    selectedimchannelcron: string;
    selectedmpimchannelcron: string;
}

const ToolButton: React.FC<{
    label: string;
    settype: (type: string | null) => void;
    setHover: (hover: boolean) => void;
    sending: boolean;
}> = ({ label, settype, setHover, sending }) => {
    const [localHover, setLocalHover] = React.useState(false);
    return (
        <button
            onClick={() => {
                settype("text");
                setHover(false);
            }}
            disabled={sending}
            onMouseEnter={() => { setLocalHover(true); setHover(true); }}
            onMouseLeave={() => { setLocalHover(false); setHover(false); }}
            className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
        >
            {localHover ? (
                <X size={17} className="text-blue-400" />
            ) : (
                <Box size={17} className="text-blue-400" />
            )}
            <span className="text-[13px] text-blue-400">
                {label}
            </span>
        </button>
    );
};

export const SlackInput: React.FC<SlackInputProps> = ({
    sessionmessage,
    pendingImages,
    setPendingImages,
    uploadingImages,
    input,
    setInput,
    Api,
    workspace,
    model,
    provider,
    loadingrecord,
    recordstatus,
    handleSend,
    sending,
    abortControllerRef,
    startRecording,
    stopRecording,
    type,
    settype,
    setHover,
    opencron,
    setopencron,
    modelList,
    modelsLoading,
    setModel,
    reasoningLevel,
    setReasoningLevel,
    publichannel,
    privatechannel,
    im,
    mpim,
    mode,
    setmode,
    channelid,
    setchannelid,
    selectedPublicchannel,
    selectedPrivatechannel,
    selectedimchannel,
    selectedmpimchannel,
    deleteslackmessage,
    loadingslackdelmsg,
    loadingcroncreate,
    cronsubmint,
    slackcron,
    setslackcron,
    handlechange,
    apiWithLogos,
    navigate,
    cronModelList,
    modelOpen,
    setModelOpen,
    customDayOfWeek,
    customDayOfMonth,
    customMonth,
    toggleCustomDayOfWeek,
    toggleCustomDayOfMonth,
    toggleCustomMonth,
    DAY_NAMES,
    MONTH_NAMES,
    maxDayOfMonth,
    selectedPublicchannelcron,
    selectedPrivatechannelcron,
    selectedimchannelcron,
    selectedmpimchannelcron,
}) => {
    return (
        <>
            <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
                <div className="flex gap-2">
                    <Button onClick={deleteslackmessage} disabled={sessionmessage.length === 0 || loadingslackdelmsg} className="bg-cyan-500 dark:bg-white">{loadingslackdelmsg ? <Spinner /> : <><RefreshCw />Reset Chat</>}</Button>
                    {workspace && (
                        <Button onClick={() => setopencron(true)} className="bg-cyan-500 dark:bg-white"><Timer />Schedule Message</Button>
                    )}
                </div>
                <div className="flex gap-2 items-center">
                    {workspace && (
                        <>
                            {(publichannel.length > 0 || privatechannel.length > 0 || im.length > 0 || mpim.length > 0) && (
                                <Select key="mode"
                                    onValueChange={(val) => {
                                        setmode(val ?? "");
                                        setchannelid("");
                                    }}
                                    value={mode}
                                    disabled={!provider}>
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {mode ? mode : "Select Channel"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        <SelectItem value="Public">Public</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                        <SelectItem value="Direct message">Direct Message</SelectItem>
                                        <SelectItem value="Group message">Group Message</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            {mode === "Public" && publichannel.length > 0 && (
                                <Select
                                    key={channelid}
                                    onValueChange={(val) => setchannelid(val ?? "")}
                                    value={channelid}
                                    disabled={!provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {channelid ? selectedPublicchannel?.substring(0, 15) + "..." : "Select Public Channel"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {publichannel.map((m: any) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {mode === "Private" && privatechannel.length > 0 && (
                                <Select
                                    key={channelid}
                                    onValueChange={(val) => setchannelid(val ?? "")}
                                    value={channelid}
                                    disabled={!provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {channelid ? selectedPrivatechannel?.substring(0, 15) + "..." : "Select Private Channel"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {privatechannel.map((m: any) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {mode === "Direct message" && im.length > 0 && (
                                <Select
                                    key={channelid}
                                    onValueChange={(val) => setchannelid(val ?? "")}
                                    value={channelid}
                                    disabled={!provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {channelid ? selectedimchannel?.substring(0, 15) + "..." : "Select Direct Message Channel"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {im.map((m: any) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {mode === "Group message" && mpim.length > 0 && (
                                <Select
                                    key={channelid}
                                    onValueChange={(val) => setchannelid(val ?? "")}
                                    value={channelid}
                                    disabled={!provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {channelid ? selectedmpimchannel?.substring(0, 15) + "..." : "Select Direct Message Channel"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {mpim.map((m: any) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
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
                    disabled={Api.length === 0 || !workspace || !model || !provider || loadingrecord || recordstatus}
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
                            disabled={Api.length === 0 || !workspace || !model || !provider || loadingrecord || recordstatus}
                            maxImages={4}
                        />
                        <SlackCronScheduler
                            opencron={opencron}
                            setopencron={setopencron}
                            slackcron={slackcron}
                            setslackcron={setslackcron}
                            handlechange={handlechange}
                            loadingcroncreate={loadingcroncreate}
                            cronsubmint={cronsubmint}
                            publichannel={publichannel}
                            privatechannel={privatechannel}
                            im={im}
                            mpim={mpim}
                            workspace={workspace}
                            Api={Api}
                            apiWithLogos={apiWithLogos}
                            navigate={navigate}
                            cronModelList={cronModelList}
                            modelOpen={modelOpen}
                            setModelOpen={setModelOpen}
                            customDayOfWeek={customDayOfWeek}
                            customDayOfMonth={customDayOfMonth}
                            customMonth={customMonth}
                            toggleCustomDayOfWeek={toggleCustomDayOfWeek}
                            toggleCustomDayOfMonth={toggleCustomDayOfMonth}
                            toggleCustomMonth={toggleCustomMonth}
                            DAY_NAMES={DAY_NAMES}
                            MONTH_NAMES={MONTH_NAMES}
                            maxDayOfMonth={maxDayOfMonth}
                            selectedPublicchannelcron={selectedPublicchannelcron}
                            selectedPrivatechannelcron={selectedPrivatechannelcron}
                            selectedimchannelcron={selectedimchannelcron}
                            selectedmpimchannelcron={selectedmpimchannelcron}
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
                                    <Box /> Read Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("send")}>
                                    <Box /> Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("listconversation")}>
                                    <Box /> List Channels
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("getuser")}>
                                    <Box /> Get Userinfo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("getteam")}>
                                    <Box /> Get Teaminfo
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {type === "send" && <ToolButton label="Send Message" settype={settype} setHover={setHover} sending={sending} />}
                        {type === "read" && <ToolButton label="Read Message" settype={settype} setHover={setHover} sending={sending} />}
                        {type === "listconversation" && <ToolButton label="List Channels" settype={settype} setHover={setHover} sending={sending} />}
                        {type === "getuser" && <ToolButton label="Get Userinfo" settype={settype} setHover={setHover} sending={sending} />}
                        {type === "getteam" && <ToolButton label="Get Teaminfo" settype={settype} setHover={setHover} sending={sending} />}
                    </div>
                    <div className="flex gap-2">
                        {Api.length > 0 && (
                            <ModelSelect modelList={modelList} provider={provider || ""} model={model} loading={modelsLoading} disabled={!provider} onSelect={setModel} reasoningLevel={reasoningLevel} onReasoningLevelChange={setReasoningLevel} />
                        )}
                        <Button
                            disabled={loadingrecord || !workspace || !model || !provider}
                            onClick={recordstatus ? stopRecording : startRecording}
                            size="icon"
                            className="bg-cyan-500 dark:bg-white rounded-full">
                            {recordstatus ? <Square size={14} className="fill-current" /> :
                                loadingrecord ? <Spinner /> : <Mic size={14} />}
                        </Button>
                        <Button
                            onClick={sending ? () => abortControllerRef.current?.abort() : handleSend}
                            disabled={!sending && (uploadingImages || !workspace || (!input.trim() && pendingImages.length === 0) || !model || !provider || loadingrecord || recordstatus)}
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
