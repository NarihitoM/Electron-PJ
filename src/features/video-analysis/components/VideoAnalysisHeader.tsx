import { Button } from "@/shared/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Video, Plus } from "lucide-react";
import { BRAND_ASSETS } from "@/shared/config/providermodels";
import { useNavigate } from "react-router-dom";

interface VideoAnalysisHeaderProps {
    Api: any[];
    provider: string;
    setProvider: (provider: string) => void;
}

export const VideoAnalysisHeader = ({ Api, provider, setProvider }: VideoAnalysisHeaderProps) => {
    const navigate = useNavigate();

    const apiWithLogos = Api ? Api.map((p: any) => ({
        ...p,
        imageUrl: BRAND_ASSETS[p.provider.toLowerCase()]
    })) : [];

    return (
        <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold flex gap-3 items-center">
                    <Video className="w-6 h-6 text-cyan-500 dark:text-white" />
                    AI Video Analysis
                </h1>
                <p className="text-muted-foreground">AI That Analyzes Videos And Transcript For You.</p>
            </div>
            {Api.length > 0 ? (
                <div className="flex items-center gap-2">
                    <Select onValueChange={(value) => setProvider(value ?? "")} value={provider}>
                        <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2 truncate ">
                                {provider ? (
                                    <>
                                        <img src={BRAND_ASSETS[provider.toLowerCase()]} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0 border" />
                                        <span className="truncate">{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                                    </>
                                ) : "Select Provider"}
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {apiWithLogos.map((item: any) => (
                                <SelectItem key={item.provider} value={item.provider}>
                                    <div className="flex items-center gap-3">
                                        <img src={item.imageUrl} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0 border" />
                                        <span>{item.provider.charAt(0).toUpperCase() + item.provider.slice(1)}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => navigate("/app/settings")} title="Add Provider">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <Button className="bg-cyan-500 dark:bg-white whitespace-nowrap shrink-0" onClick={() => navigate("/app/settings")}>
                    Add Provider
                </Button>
            )}
        </div>
    );
};
