import { useEffect, useRef, useState } from "react"
import { ArrowUp, ToolCaseIcon, X, RefreshCw, Square, Mic, Timer, Box } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Textarea } from "@/shared/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/shared/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu"
import { Spinner } from "@/shared/components/ui/spinner"
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload"
import { ModelSelect } from "@/features/chat/components/ModelSelect"
import { toast } from "sonner"
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys"
import { useTelegramAccount } from "@/features/telegram/hooks/useTelegramAccount"
import { getProviderModels } from "@/shared/config/providermodels"
import { telegramauth } from "@/features/telegram/api/api"
import { chatauth } from "@/features/chat/api/api"
import { voiceauth } from "@/features/voice/api/api"
import { telegramauthstore } from "@/features/telegram/store/store"
import { TelegramCronScheduler } from "./TelegramCronScheduler"
import { useQueryClient } from "@tanstack/react-query"
import type { ModelEntry } from "@/shared/lib/modelsapi"

export const TelegramInput = () => {
    const { data: Api = [] } = useServiceKeys()
    const { data: accountData } = useTelegramAccount()
    const store = telegramauthstore()
    const queryClient = useQueryClient()

    const [recordstatus, setrecordstatus] = useState(false)
    const [loadingrecord, setloadingrecord] = useState(false)
    const [modelList, setModelList] = useState<ModelEntry[]>([])
    const [modelsLoading, setModelsLoading] = useState(false)

    const abortControllerRef = useRef<AbortController | null>(null)
    const lastSentInputRef = useRef("")
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const connected = !!accountData
    const groups = accountData?.groups ?? []
    const contacts = accountData?.contacts ?? []

    useEffect(() => {
        if (!store.provider) { setModelList([]); return }
        setModelsLoading(true)
        getProviderModels(store.provider).then(models => {
            setModelList(models)
            setModelsLoading(false)
            if (models.length > 0 && !models.some(m => m.model === store.model)) {
                store.setModel(models[0].model)
            }
        })
    }, [store.provider])

    useEffect(() => () => abortControllerRef.current?.abort(), [])

    const handleSend = async () => {
        const targetId =
            store.mode === "group"
                ? store.selectedGroupId
                : store.mode === "contact"
                    ? store.selectedContactId
                    : ""

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            if (!store.input.trim()) return
        }

        if (!store.input.trim() || !store.provider || !store.model || !targetId) return

        const controller = new AbortController()
        abortControllerRef.current = controller
        store.setSending(true)

        const currentInput = store.input
        const currentImages = [...store.pendingImages]
        lastSentInputRef.current = currentInput
        store.setInput("")
        store.setPendingImages([])

        const blobUrls = currentImages.map(file => URL.createObjectURL(file))
        const userMsg = { role: "user" as const, content: currentInput, images: blobUrls.length > 0 ? blobUrls : undefined }
        store.setsessionmessage([...store.sessionmessage, userMsg, { role: "assistant" as const, content: "", provider: store.provider, model: store.model }])

        if (blobUrls.length > 0) {
            store.setUploadingImageUrls(new Set(blobUrls))
        }

        let uploadedUrls: string[] = []
        if (currentImages.length > 0) {
            store.setUploadingImages(true)
            try {
                uploadedUrls = await Promise.all(
                    currentImages.map(file => chatauth.uploadImage(file))
                )
            } catch {
                toast.error("Failed to upload images")
                store.setSending(false)
                store.setUploadingImages(false)
                store.setUploadingImageUrls(new Set())
                store.updateSessionMessages(prev => prev.slice(0, -2))
                return
            }
            store.setUploadingImages(false)
            store.setUploadingImageUrls(new Set())
            store.updateSessionMessages(prev => {
                const newMsgs = [...prev]
                const userMsgIdx = newMsgs.length - 2
                if (userMsgIdx >= 0 && newMsgs[userMsgIdx].role === "user") {
                    newMsgs[userMsgIdx] = { ...newMsgs[userMsgIdx], images: uploadedUrls }
                }
                return newMsgs
            })
            blobUrls.forEach(url => URL.revokeObjectURL(url))
        }

        try {
            await telegramauth.sendmessage(
                currentInput,
                store.provider,
                store.model,
                targetId ?? "",
                store.type ?? "",
                uploadedUrls.length > 0 ? uploadedUrls : undefined,
                (chunk) => {
                    store.updateSessionMessages(prev => {
                        const ns = [...prev]
                        const li = ns.length - 1
                        if (ns[li]?.role === "assistant") {
                            ns[li] = { ...ns[li], content: ns[li].content + chunk }
                        }
                        return ns
                    })
                },
                (chunk: string) => {
                    store.updateSessionMessages(prev => {
                        const ns = [...prev]
                        const li = ns.length - 1
                        if (ns[li]?.role === "assistant") ns[li] = { ...ns[li], thinking: (ns[li].thinking || "") + chunk }
                        return ns
                    })
                },
                (status) => {
                    store.updateSessionMessages(prev => {
                        const ns = [...prev]
                        const li = ns.length - 1
                        if (ns[li]?.role !== "assistant") return prev

                        const cm = { ...ns[li] }
                        const tc = [...(cm.toolsCall || [])]

                        if (status.type === "chain" && status.step === "start") {
                            tc.push({
                                id: status.id,
                                name: status.name ?? "Thinking",
                                query: null,
                                status: "loading" as const,
                                result: null,
                                isChain: true,
                                input: status.input,
                            })
                        } else if (status.type === "chain" && status.step === "end") {
                            const idx = tc.findIndex(t => t.id === status.id)
                            if (idx !== -1) {
                                tc[idx] = { ...tc[idx], status: "done" as const, output: status.output }
                            }
                        } else if (status.step === "tool_start") {
                            tc.push({
                                id: status.id,
                                name: status.tool ?? "Tool",
                                query: (status as any).query ?? null,
                                status: "loading" as const,
                                result: null,
                            })
                        } else if (status.step === "tool_end") {
                            const idx = tc.findIndex(t => t.id === status.id)
                            if (idx !== -1) {
                                tc[idx] = { ...tc[idx], status: "done" as const, result: status.result }
                            }
                        } else if (status.step === "tool_error") {
                            const idx = tc.findIndex(t => t.id === status.id)
                            if (idx !== -1) {
                                tc[idx] = { ...tc[idx], status: "error" as const, result: status.error }
                            }
                        }

                        ns[li] = { ...cm, toolsCall: tc }
                        return ns
                    })
                },
                (data) => {
                    const toolCall = data.tool_calls[0]
                    if (toolCall) {
                        store.threadIdRef.current = data.thread_id
                        store.pendingApprovalRef.current = { name: toolCall.name, query: toolCall.query ?? null }
                        store.setPendingApproval({ name: toolCall.name, query: toolCall.query ?? null })
                    }
                },
                (url) => {
                    store.updateSessionMessages(prev => {
                        const nm = [...prev]
                        const li = nm.length - 1
                        if (li >= 0 && nm[li].role === "assistant") {
                            nm[li] = { ...nm[li], generatedImages: [...(nm[li].generatedImages || []), url] }
                        }
                        return nm
                    })
                },
                controller.signal,
                store.reasoningLevel || undefined,
            )
        } catch (err: any) {
            if (err?.name === "AbortError") {
                if (abortControllerRef.current === controller) {
                    store.setInput(lastSentInputRef.current)
                }
                return
            }
            toast.error(err?.response?.data?.message || err?.message || "An unexpected error occurred.")
        } finally {
            if (abortControllerRef.current === controller) {
                store.setSending(false)
                abortControllerRef.current = null
            }
            queryClient.invalidateQueries({ queryKey: ["usage-stats"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
            queryClient.invalidateQueries({ queryKey: ["creditBalance"], refetchType: 'all' })
        }
    }

    const telegrammsgdelete = async () => {
        try {
            store.setLoadingdeletemsg(true)
            const response = await telegramauth.telegrammsgreset()
            if (response.success) {
                toast.success(response.message)
                store.setsessionmessage([])
                store.setNextCursor(null)
                store.setHasMore(false)
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any
                toast.error(Error.response?.data?.message || err.message)
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            store.setLoadingdeletemsg(false)
        }
    }

    const startRecording = async () => {
        if (recordstatus) { stopRecording(); return }
        store.setInput("")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        const audioChunks: Blob[] = []
        mediaRecorder.ondataavailable = (event) => { audioChunks.push(event.data) }
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
            setrecordstatus(false)
            const form = new FormData()
            form.append("voice", audioBlob, "voice.webm")
            try {
                setloadingrecord(true)
                const response = await voiceauth.sendvoice(form)
                if (response.transcribe) store.setInput(response.transcribe)
            } catch (err) {
                if (err instanceof Error) {
                    const Error = err as any
                    toast.error(Error.response?.data?.message || err.message)
                } else { toast.error("An unexpected error occurred.") }
            } finally { setloadingrecord(false) }
        }
        mediaRecorder.start()
        setrecordstatus(true)
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop()
        if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null }
    }

    const selectedGroupTitle = groups.find(g => g.id === store.selectedGroupId)?.title || ""
    const selectContactName = contacts.find(c => c.id === store.selectedContactId)?.name || ""

    return (
        <>
            <TelegramCronScheduler />
            <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
                <div className="flex gap-2">
                    <Button onClick={telegrammsgdelete} disabled={store.sessionmessage.length === 0 || store.loadingdeletemsg} className="bg-cyan-500 dark:bg-white">
                        {store.loadingdeletemsg ? <Spinner /> : <><RefreshCw />Reset Chat</>}
                    </Button>
                    {connected && (
                        <Button onClick={() => store.setOpencron(true)} className="bg-cyan-500 dark:bg-white"><Timer />Schedule Message</Button>
                    )}
                </div>
                <div className="flex gap-2 items-center">
                    {connected && (
                        <>
                            {groups.length > 0 && contacts.length > 0 && (
                                <Select key="mode"
                                    onValueChange={(val) => {
                                        store.setmode(val ?? "")
                                        store.setSelectedGroupId("")
                                        store.setSelectedContactId("")
                                    }}
                                    value={store.mode}
                                    disabled={!store.provider}>
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {store.mode ? store.mode : "Select Mode"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        <SelectItem value="group">Group</SelectItem>
                                        <SelectItem value="contact">Contact</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            {store.mode === "group" && groups.length > 0 && (
                                <Select
                                    key={store.selectedGroupId}
                                    onValueChange={(val) => store.setSelectedGroupId(val ?? "")}
                                    value={store.selectedGroupId}
                                    disabled={!store.provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {store.selectedGroupId ? selectedGroupTitle.substring(0, 15) + "..." : "Select Groups"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {groups.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {store.mode === "contact" && contacts.length > 0 && (
                                <Select
                                    key={store.selectedContactId}
                                    onValueChange={(val) => store.setSelectedContactId(val ?? "")}
                                    value={store.selectedContactId}
                                    disabled={!store.provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {store.selectedContactId ? selectContactName.substring(0, 15) + "..." : "Select Contacts"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {contacts.map((m) => (
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
                    images={store.pendingImages}
                    onImagesChange={store.setPendingImages}
                    uploading={store.uploadingImages}
                />
                <Textarea
                    disabled={Api.length === 0 || !connected || !store.model || !store.provider || loadingrecord || recordstatus}
                    value={store.input}
                    onChange={(e) => store.setInput(e.target.value)}
                    placeholder={recordstatus ? "Listening..." : loadingrecord ? "Transcribing..." : "Message..."}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
                    }}
                    className="border-none max-h-50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                />

                <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2 items-center">
                        <ImagePicker
                            images={store.pendingImages}
                            onImagesChange={store.setPendingImages}
                            uploading={store.uploadingImages}
                            disabled={Api.length === 0 || !connected || !store.model || !store.provider || loadingrecord || recordstatus}
                            maxImages={4}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="outline" className="flex gap-1 items-center cursor-pointer">
                                    <ToolCaseIcon size={15} />
                                    <span className="text-sm">Tools</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" side="top" className="w-45">
                                <DropdownMenuItem onClick={() => store.settype("read")}>
                                    <Box /> Read Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => store.settype("readusers")}>
                                    <Box /> Read Chat Members
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => store.settype("send")}>
                                    <Box /> Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => store.settype("getinfo")}>
                                    <Box /> Get info
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {store.type === "read" && (
                            <button
                                onClick={() => { store.settype(""); store.setHover(false) }}
                                disabled={store.sending}
                                onMouseEnter={() => store.setHover(true)}
                                onMouseLeave={() => store.setHover(false)}
                                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                            >
                                {store.hover ? <X size={17} className="text-blue-400" /> : <Box size={17} className="text-blue-400" />}
                                <span className="text-[13px] text-blue-400">Read Message</span>
                            </button>
                        )}
                        {store.type === "readusers" && (
                            <button
                                onClick={() => { store.settype(""); store.setHover(false) }}
                                disabled={store.sending}
                                onMouseEnter={() => store.setHover(true)}
                                onMouseLeave={() => store.setHover(false)}
                                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                            >
                                {store.hover ? <X size={17} className="text-blue-400" /> : <Box size={17} className="text-blue-400" />}
                                <span className="text-[13px] text-blue-400">Read Chat Members</span>
                            </button>
                        )}
                        {store.type === "send" && (
                            <button
                                onClick={() => { store.settype(""); store.setHover(false) }}
                                disabled={store.sending}
                                onMouseEnter={() => store.setHover(true)}
                                onMouseLeave={() => store.setHover(false)}
                                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                            >
                                {store.hover ? <X size={17} className="text-blue-400" /> : <Box size={17} className="text-blue-400" />}
                                <span className="text-[13px] text-blue-400">Send Message</span>
                            </button>
                        )}
                        {store.type === "getinfo" && (
                            <button
                                onClick={() => { store.settype(""); store.setHover(false) }}
                                disabled={store.sending}
                                onMouseEnter={() => store.setHover(true)}
                                onMouseLeave={() => store.setHover(false)}
                                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                            >
                                {store.hover ? <X size={17} className="text-blue-400" /> : <Box size={17} className="text-blue-400" />}
                                <span className="text-[13px] text-blue-400">Get info</span>
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {Api.length > 0 && (
                            <ModelSelect modelList={modelList} provider={store.provider || ""} model={store.model} loading={modelsLoading} disabled={!store.provider} onSelect={store.setModel} reasoningLevel={store.reasoningLevel} onReasoningLevelChange={store.setReasoningLevel} />
                        )}
                        <Button
                            disabled={loadingrecord || !connected || !store.model || !store.provider}
                            onClick={recordstatus ? stopRecording : startRecording}
                            size="icon"
                            className="bg-cyan-500 dark:bg-white rounded-full"
                        >
                            {recordstatus ? <Square size={14} className="fill-current" /> :
                                loadingrecord ? <Spinner /> : <Mic size={14} />}
                        </Button>
                        <Button
                            onClick={store.sending ? () => abortControllerRef.current?.abort() : handleSend}
                            disabled={!store.sending && (store.uploadingImages || !connected || (!store.input.trim() && store.pendingImages.length === 0) || !store.model || !store.provider || loadingrecord || recordstatus)}
                            size="icon"
                            className={store.sending ? "bg-red-500 hover:bg-red-600 rounded-full" : "bg-cyan-500 dark:bg-white rounded-full"}
                        >
                            {store.sending ? <Square size={16} className="fill-current" /> : <ArrowUp size={16} />}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
