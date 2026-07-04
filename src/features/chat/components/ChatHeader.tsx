import { Bot, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { BRAND_ASSETS } from "@/shared/config/providermodels";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/shared/components/ui/select";

interface ProviderLogo {
    provider: string;
    imageUrl: string;
}

interface ChatHeaderProps {
    apiWithLogos: ProviderLogo[];
    provider: string | null;
    onProviderChange: (value: string) => void;
    onAddProvider: () => void;
}

export function ChatHeader({ apiWithLogos, provider, onProviderChange, onAddProvider }: ChatHeaderProps) {
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
                    <Select onValueChange={(value) => onProviderChange(value ?? "")} value={provider ?? undefined}>
                        <SelectTrigger >
                            {provider ?
                                <>
                                    <img src={BRAND_ASSETS[provider.toLowerCase()]} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                    <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                                </> : "Select Provider"}
                        </SelectTrigger>
                        <SelectContent>
                            {apiWithLogos.map((item) => (
                                <SelectItem key={item.provider} value={item.provider}>
                                    <img src={item.imageUrl} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                    <span>{item.provider.charAt(0).toUpperCase() + item.provider.slice(1)}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={onAddProvider} title="Add Provider">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <Button className="bg-cyan-500 dark:bg-white" onClick={onAddProvider}>Add Provider</Button>
            )}
        </div>
    );
}
