import { Bot, Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys"
import { BRAND_ASSETS, getProviderDisplayName } from "@/shared/config/providermodels"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/shared/components/ui/select"
import { chatauthstore } from "../store/store"

export const ChatHeader = () => {
    const { data: Api = [] } = useServiceKeys()
    const store = chatauthstore()
    const navigate = useNavigate()

    const apiWithLogos = Api.map((provider: any) => ({
        ...provider,
        imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()]
    }))

    return (
        <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold flex gap-3 items-center">
                    <Bot className="w-6 h-6 text-cyan-500 dark:text-white" />
                    Chatbot</h1>
                <p className="text-muted-foreground">Your Ai Chatbot and Assistant.</p>
            </div>
            {apiWithLogos.length > 0 ? (
                <div className="flex gap-2">
                    <Select onValueChange={(value) => {
                        if (value) {
                            store.setProvider(value)
                        }
                    }} value={store.provider}>
                        <SelectTrigger>
                            {store.provider ?
                                <>
                                    <img src={BRAND_ASSETS[store.provider.toLowerCase()]} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                    <span>{getProviderDisplayName(store.provider)}</span>
                                </> : "Select Provider"}
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
    )
}
