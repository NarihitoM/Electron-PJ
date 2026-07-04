import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/shared/components/ui/select";
import { BRAND_ASSETS } from "@/shared/config/providermodels";
import type { NavigateFunction } from "react-router-dom";
import type { Servicefetch } from "@/features/services/types";

interface SlackChatHeaderProps {
    loadingslack: boolean;
    workspace: string;
    Api: Servicefetch[];
    provider: string;
    setProvider: (value: string) => void;
    apiWithLogos: (Servicefetch & { imageUrl: string })[];
    navigate: NavigateFunction;
}

export const SlackChatHeader: React.FC<SlackChatHeaderProps> = ({
    loadingslack,
    workspace,
    Api,
    provider,
    setProvider,
    apiWithLogos,
    navigate,
}) => {
    return (
        <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <img src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" className="w-7 h-7" />
                    SlackAgent
                </h1>
                <p className="text-muted-foreground">You can edit and send message with your slack agent.</p>
            </div>
            <div className="flex gap-2 items-center">
                {loadingslack ? (
                    <span className="flex items-center gap-2 px-1 py-1 rounded-full border border-transparent">
                        <Skeleton className="w-4 h-4 rounded-sm bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                        <Skeleton className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                    </span>
                ) : (
                    workspace && (
                        <span className="text-[13px] flex items-center gap-2 px-2 py-1 rounded-full border bg-card">
                            <img src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" className="w-4 h-4" />
                            {workspace.substring(0, 10) + "..."}
                        </span>
                    )
                )}
                {Api.length > 0 ? (
                    <div className="flex gap-2">
                        <Select onValueChange={(value) => setProvider(value ?? "")} value={provider}>
                            <SelectTrigger>
                                {provider ? (
                                    <>
                                        <img
                                            src={BRAND_ASSETS[provider.toLowerCase()]}
                                            className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                        />
                                        <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                                    </>
                                ) : (
                                    "Select Provider"
                                )}
                            </SelectTrigger>
                            <SelectContent>
                                {apiWithLogos.map((item) => (
                                    <SelectItem key={item.provider} value={item.provider}>
                                        <img
                                            src={item.imageUrl}
                                            className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                        />
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
                    <Button className="bg-cyan-500 dark:bg-white" onClick={() => navigate("/app/settings")}>
                        Add Provider
                    </Button>
                )}
            </div>
        </div>
    );
};
