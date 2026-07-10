import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select"
import { BRAND_ASSETS, getProviderDisplayName } from "@/shared/config/providermodels"
import { useNavigate } from "react-router-dom"
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys"
import { useNotionAccount } from "../hooks/useNotionAccount"
import { notionauthstore } from "../store/store"

export const NotionChatHeader = () => {
    const store = notionauthstore()
    const { data: Api = [] } = useServiceKeys()
    const { data: notionAccount } = useNotionAccount()
    const navigate = useNavigate()

    const workspacename = (notionAccount as any)?.workspacename ?? ""
    const loadingnotion = !notionAccount

    const apiWithLogos = Api.map((provider: any) => ({
        ...provider,
        imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()]
    }))

    return (
        <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-7 h-7" />
                    NotionAgent
                </h1>
                <p className="text-muted-foreground">You can edit and update with your notion agent.</p>
            </div>
            <div className="flex gap-2 items-center">
                {loadingnotion ? (
                    <span className="flex items-center gap-2 px-1 py-1 rounded-full border border-transparent">
                        <Skeleton className="w-4 h-4 rounded-sm bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                        <Skeleton className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                    </span>
                ) : workspacename ? (
                    <span className="text-[13px] flex items-center gap-2 px-2 py-1 rounded-full border bg-card">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-4 h-4" />
                        {workspacename.substring(0, 10)}...
                    </span>
                ) : null}
                {apiWithLogos.length > 0 ? (
                    <div className="flex gap-2">
                        <Select onValueChange={(value) => store.setProvider(value ?? "")} value={store.provider}>
                            <SelectTrigger>
                                {store.provider ? (
                                    <>
                                        <img src={BRAND_ASSETS[store.provider.toLowerCase()]} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                        <span>{getProviderDisplayName(store.provider)}</span>
                                    </>
                                ) : "Select Provider"}
                            </SelectTrigger>
                            <SelectContent>
                                {apiWithLogos.map((item: any) => (
                                    <SelectItem key={item.provider} value={item.provider}>
                                        <img src={item.imageUrl} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                        <span>{getProviderDisplayName(item.provider)}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={() => navigate("/app/settings")} title="Add Provider">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button className="bg-cyan-500 dark:bg-white" onClick={() => navigate("/app/settings")}>Add Provider</Button>
                )}
            </div>
        </div>
    )
}
