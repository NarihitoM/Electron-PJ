import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"
import { Spinner } from "@/shared/components/ui/spinner"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { ChevronsUpDown, Plus } from "lucide-react"
import { BRAND_ASSETS, getProviderImage, getProviderModels } from "@/shared/config/providermodels"
import { ToolLabels } from "@/shared/config/toolsselection"
import { useagentstore } from "../store/store"
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys"
import { agentauth } from "../api/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

export const AgentNodeForm = () => {
    const store = useagentstore()
    const { data: Api = [] } = useServiceKeys()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [loadingnode, setLoadingnode] = useState(false)

    const mode = store.nodeDialogMode
    const open = store.nodeDialogOpen

    const apiWithLogos = Api.map((item: any) => ({
        ...item,
        imageUrl: BRAND_ASSETS[item.provider.toLowerCase()]
    }))

    useEffect(() => {
        if (!open) return
        if (!store.provider) { store.setModelList([]); return }
        store.setModelsLoading(true)
        getProviderModels(store.provider).then(models => {
            store.setModelList(models)
            store.setModelsLoading(false)
            if (models.length > 0 && !models.some(m => m.model === store.model)) {
                store.setModel(models[0].model)
            }
        })
    }, [store.provider, open])

    const onSubmit = async () => {
        setLoadingnode(true)
        try {
            if (mode === "create") {
                const response = await agentauth.addnode(
                    store.name, store.provider, store.actor,
                    store.model, store.tool ?? "", store.prompt
                )
                if (response.success) {
                    toast.success("Node created successfully")
                    queryClient.invalidateQueries({ queryKey: ["node"] })
                    store.resetForm()
                } else {
                    toast.error(response.message)
                }
            } else if (mode === "update") {
                const response = await agentauth.updatenode(
                    store.nodeid, store.name, store.provider, store.actor,
                    store.model, store.tool ?? "", store.prompt
                )
                if (response.success) {
                    toast.success("Node updated successfully")
                    queryClient.invalidateQueries({ queryKey: ["node"] })
                    store.resetForm()
                } else {
                    toast.error(response.message)
                }
            } else if (mode === "delete") {
                const response = await agentauth.deletenode(store.nodeid)
                if (response.success) {
                    toast.success("Node deleted successfully")
                    queryClient.invalidateQueries({ queryKey: ["node"] })
                    store.resetForm()
                } else {
                    toast.error(response.message)
                }
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "An unexpected error occurred.")
        } finally {
            setLoadingnode(false)
        }
    }

    const title = mode === "create" ? "Add Agent Node" : mode === "update" ? "Update Agent Node" : "Delete Agent Node"
    const description = mode === "delete" ? null : "Add your own ai agent into your workflow."
    const submitLabel = mode === "create" ? "Add" : mode === "update" ? "Update" : "Delete"

    return (
        <Dialog open={open} onOpenChange={store.setNodeDialogOpen} modal={false}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl">{title}</DialogTitle>
                </DialogHeader>
                {description && <DialogDescription>{description}</DialogDescription>}

                {mode === "delete" ? (
                    <DialogDescription>
                        Are you sure do you want to delete{" "}
                        <span className="font-semibold">"{store.name}"</span>?
                    </DialogDescription>
                ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Agent Name</Label>
                            <Input
                                id="name"
                                placeholder={mode === "create" ? "Enter Agent Name" : "Enter New Agent"}
                                value={store.name}
                                onChange={(e) => store.setName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                placeholder="Agent Name..."
                                value={store.actor}
                                disabled
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="prompt">Prompt</Label>
                            <Textarea
                                id="prompt"
                                placeholder={mode === "create" ? "Enter Agent Prompt" : "Enter New Agent Prompt"}
                                className="resize-none h-20"
                                value={store.prompt}
                                onChange={(e) => store.setPrompt(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between gap-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="provider">Provider</Label>
                                <div className="flex items-center gap-2">
                                    <Select
                                        onValueChange={(value) => {
                                            store.setProvider(value ?? "")
                                            store.setModel("")
                                        }}
                                        value={store.provider}
                                    >
                                        <SelectTrigger>
                                            {store.provider ? (
                                                <>
                                                    <img
                                                        src={BRAND_ASSETS[store.provider.toLowerCase()]}
                                                        className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                                    />
                                                    <span>
                                                        {store.provider.charAt(0).toUpperCase() + store.provider.slice(1)}
                                                    </span>
                                                </>
                                            ) : "Select Provider"}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {apiWithLogos.map((item: any) => (
                                                <SelectItem key={item.provider} value={item.provider}>
                                                    <img
                                                        src={item.imageUrl}
                                                        className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                                    />
                                                    <span>
                                                        {item.provider.charAt(0).toUpperCase() + item.provider.slice(1)}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => navigate("/app/settings")}
                                        title="Add Provider"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="Tool">Tools</Label>
                                <Popover open={store.toolOpen} onOpenChange={store.setToolOpen}>
                                    <PopoverTrigger>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={store.toolOpen}
                                            className="w-full justify-between"
                                        >
                                            {store.tool ? ToolLabels[store.tool] : "Select tool..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-1" align="start">
                                        <Command className="bg-transparent">
                                            <CommandInput placeholder="Search tool..." />
                                            <CommandList>
                                                <CommandEmpty>No tool found.</CommandEmpty>
                                                <CommandGroup>
                                                    {Object.entries(ToolLabels).map(([key, label]) => (
                                                        <CommandItem
                                                            key={key}
                                                            value={label}
                                                            onSelect={() => {
                                                                store.setTool(key)
                                                                store.setToolOpen(false)
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            {label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="model">Models</Label>
                                {Api.length > 0 && (
                                    <Popover open={store.modelOpen} onOpenChange={store.setModelOpen}>
                                        <PopoverTrigger
                                            render={
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={store.modelOpen}
                                                    className="justify-between"
                                                    disabled={!store.provider || store.modelsLoading}
                                                />
                                            }
                                        >
                                            {store.modelsLoading ? (
                                                <span className="text-sm text-muted-foreground">Loading...</span>
                                            ) : store.model ? (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={getProviderImage(store.provider || "")}
                                                        className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                                    />
                                                    <span className="truncate">
                                                        {store.model.substring(0, 7) + "..."}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Select Model</span>
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </PopoverTrigger>
                                        <PopoverContent className="p-1" align="start">
                                            <Command className="bg-transparent">
                                                <CommandInput placeholder="Search model..." />
                                                <CommandList>
                                                    <CommandEmpty>No model found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {store.modelList.length === 0 && !store.modelsLoading && (
                                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                                No models available.
                                                            </div>
                                                        )}
                                                        {store.modelList.map((entry) => (
                                                            <CommandItem
                                                                key={entry.model}
                                                                value={entry.model}
                                                                onSelect={() => {
                                                                    store.setModel(entry.model)
                                                                    store.setModelOpen(false)
                                                                }}
                                                            >
                                                                <img
                                                                    src={getProviderImage(store.provider || "")}
                                                                    className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                                                />
                                                                <span className="text-sm ml-3">{entry.model}</span>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <DialogFooter>
                    <Button
                        disabled={loadingnode}
                        onClick={onSubmit}
                        className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                    >
                        {loadingnode ? <Spinner /> : submitLabel}
                    </Button>
                    <Button
                        onClick={() => store.setNodeDialogOpen(false)}
                        variant="destructive"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
