import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { GoogleIcon } from "@/shared/components/ui/googleicon"
import { Plus } from "lucide-react"
import { BRAND_ASSETS } from "@/shared/config/providermodels"
import { useNavigate } from "react-router-dom"
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys"
import { useGoogleService } from "@/features/google/hooks/useGoogleService"
import { googleauthstore } from "../store/store"

export const GoogleSheetHeader = () => {
    const { data: Api = [] } = useServiceKeys()
    const { data: googleService } = useGoogleService()
    const store = googleauthstore()
    const navigate = useNavigate()

    const serviceemail = (googleService as any)?.email ?? ""
    const loadingfetch = !googleService

    const apiWithLogos = Api ? Api.map((provider: any) => ({
        ...provider,
        imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()]
    })) : []

    return (
        <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl  font-bold flex items-center gap-3"><img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" className="w-7 h-7" />GoogleSheetAgent</h1>
                <p className="text-muted-foreground">Automate your googlesheet datas with Agent.</p>
            </div>
            <div className="flex gap-2 items-center">
                {loadingfetch ?
                    <span className="flex items-center gap-2 px-1 py-1 rounded-full border border-transparent">
                        <Skeleton className="w-4 h-4 rounded-sm bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                        <Skeleton className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                    </span> :
                    serviceemail &&
                    <span className="text-[13px] flex items-center gap-2 px-2 py-1 rounded-full border bg-card">
                        <GoogleIcon />{serviceemail.substring(0, 10) + "..."}
                    </span>}
                {Api.length > 0 ? (
                    <div className="flex gap-2">
                        <Select onValueChange={(value) => store.setProvider(value ?? "")} value={store.provider}>
                            <SelectTrigger >
                                {store.provider ?
                                    <>
                                        <img src={BRAND_ASSETS[store.provider.toLowerCase()]} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                        <span>{store.provider.charAt(0).toUpperCase() + store.provider.slice(1)}</span>
                                    </> : "Select Provider"}
                            </SelectTrigger>
                            <SelectContent>
                                {apiWithLogos.map((item: any) => (
                                    <SelectItem key={item.provider} value={item.provider}>
                                        <img src={item.imageUrl} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                        <span>{item.provider.charAt(0).toUpperCase() + item.provider.slice(1)}</span>
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
