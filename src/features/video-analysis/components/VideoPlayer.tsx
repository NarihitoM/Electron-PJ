import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";
import { RefreshCw, ChevronsUpDown } from "lucide-react";
import { getProviderImage } from "@/shared/config/providermodels";
import type { ModelEntry } from "@/shared/lib/modelsapi";

interface VideoPlayerProps {
    videoSrc: string;
    videoFile: File | null;
    provider: string;
    model: string;
    modelList: ModelEntry[];
    modelsLoading: boolean;
    modelOpen: boolean;
    setModelOpen: (open: boolean) => void;
    setModel: (model: string) => void;
    Api: any[];
    isPending: boolean;
    loadingupload: boolean;
    onClearVideo: (e: React.MouseEvent) => void;
    onGenerate: () => void;
}

export const VideoPlayer = ({
    videoSrc,
    videoFile,
    provider,
    model,
    modelList,
    modelsLoading,
    modelOpen,
    setModelOpen,
    setModel,
    Api,
    isPending,
    loadingupload,
    onClearVideo,
    onGenerate,
}: VideoPlayerProps) => {
    return (
        <div className="relative w-full h-full flex flex-col group gap-4">
            <video
                src={videoSrc}
                controls
                className="rounded-lg w-full h-80 border dark:border-muted-foreground bg-black"
            />
            <div className="w-full flex flex-row items-start justify-between gap-4 border-t dark:border-zinc-800 pt-3 px-2">
                <div className="flex flex-col gap-3 text-muted-foreground truncate text-sm">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate" title={videoFile?.name}>
                        {videoFile?.name}
                    </span>
                    <div className="flex items-center gap-2 ">
                        <span>
                            {(videoFile?.size! / (1024 * 1024)).toFixed(1)} MB
                        </span>
                        <span className="uppercase bg-cyan-500 dark:bg-white px-1.5 py-0.5 rounded text-[10px] font-sans font-bold text-white dark:text-black border border-transparent">
                            {videoFile?.type.split("/")[1] || "video"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {Api.length > 0 && (
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="model">Models</Label>
                                <Popover open={modelOpen} onOpenChange={setModelOpen}>
                                    <PopoverTrigger render={<Button variant="outline" role="combobox" aria-expanded={modelOpen} className="justify-between" disabled={!provider || modelsLoading} />}>
                                        {modelsLoading ? (
                                            <span className="text-sm text-muted-foreground">Loading...</span>
                                        ) : model ? (
                                            <div className="flex items-center gap-2">
                                                <img src={getProviderImage(provider || "")} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                                <span className="truncate">{model}</span>
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
                                                    {modelList.length === 0 && !modelsLoading && (
                                                        <div className="px-3 py-2 text-sm text-muted-foreground">No models available.</div>
                                                    )}
                                                    {modelList.map((entry) => (
                                                        <CommandItem key={entry.model} value={entry.model} onSelect={() => { setModel(entry.model); setModelOpen(false); }}>
                                                            <img src={getProviderImage(provider || "")} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                                            <span className="text-sm ml-3">{entry.model}</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <Button
                        onClick={onClearVideo}
                        className="flex bg-cyan-500 dark:bg-white"
                    >
                        <RefreshCw size={13} />
                        Change Video
                    </Button>
                </div>
            </div>
            <div className="flex px-2">
                {Api.length > 0 &&
                    <Button onClick={onGenerate} disabled={isPending || loadingupload || !model || !provider} className="bg-cyan-500 dark:bg-white">{
                        (isPending || loadingupload) ?
                            <>
                                <Spinner />
                                {loadingupload ? "Uploading" : "Generating transcript and summary"}
                            </> : "Generate"}
                    </Button>}
            </div>
        </div>
    );
};
