import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/shared/components/ui/resizable"
import { Toaster } from "@/shared/components/ui/sonner"
import { videoauthstore } from "@/features/video-analysis/store/store";
import { useVideoTranscript } from "@/features/video-analysis/hooks/useVideoTranscript";
import { useRef, useState, useEffect } from "react";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import { getProviderModels } from "@/shared/config/providermodels";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { toast } from "sonner";
import { videoauth } from "@/features/video-analysis/api/api";
import { VideoAnalysisHeader } from "@/features/video-analysis/components/VideoAnalysisHeader";
import { VideoUploader } from "@/features/video-analysis/components/VideoUploader";
import { VideoPlayer } from "@/features/video-analysis/components/VideoPlayer";
import { VideoAnalysisResult } from "@/features/video-analysis/components/VideoAnalysisResult";


export const Aivideoanalyse = () => {

    //Store
    const { data: Api = [] } = useServiceKeys();

    const videoTranscriptMutation = useVideoTranscript();

    const {
        model,
        provider,
        videoSrc,
        videoFile,
        summary,
        timestamps,
        setVideoSrc,
        setVideoFile,
        setsummary,
        settimestamps,
        setModel,
        setProvider,
    } = videoauthstore()

    //States
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loadingupload, setloadingupload] = useState<boolean>(false);
    const [analysisError, setAnalysisError] = useState<boolean>(false);
    const [modelList, setModelList] = useState<ModelEntry[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelOpen, setModelOpen] = useState(false);

    useEffect(() => {
        if (!provider) { setModelList([]); return; }
        setModelsLoading(true);
        getProviderModels(provider).then(models => {
            setModelList(models);
            setModelsLoading(false);
            if (models.length > 0 && !models.some(m => m.model === model)) {
                setModel(models[0].model);
            }
        });
    }, [provider]);

    //Functions
    const handleContainerClick = () => {
        if (!videoSrc) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("video/")) {
            if (file.size > 50 * 1024 * 1024) {
                toast.error("Please Upload file size up to 50mb.")
                return;
            }
            setVideoFile(file);
            const videoUrl = URL.createObjectURL(file);

            setVideoSrc(videoUrl);
        } else if (file) {
            alert("Please select a valid video format file.");
        }
    };

    const handleClearVideo = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoSrc) {
            URL.revokeObjectURL(videoSrc);
        }
        setVideoSrc(null);
        setVideoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const generatetranscript = async () => {
        if (!provider || !model) {
            toast.error("Please select a provider and model first.");
            return;
        }
        try {
            setsummary(null);
            settimestamps([]);

            setloadingupload(true);
            const response = await videoauth.videouploadviasupabase(videoFile?.name!);
            const uploadurl = response.data?.uploadUrl;

            if (!uploadurl) {
                toast.error("Fail to upload video")
                setloadingupload(false);
                return;
            }

            const data = await videoauth.videoupload(
                uploadurl!,
                videoFile
            )

            if (!data || !data.Key) {
                const errorMsg = "File is too large. Allowed only up to 50mb";
                toast.error(errorMsg);
                setloadingupload(false);
                return;
            }


            const key = data.Key;
            const supabaseUrl = import.meta.env.VITE_SUPABASE || "";
            const publicVideoUrl = `${supabaseUrl}/storage/v1/object/public/${key}`;
            if (!publicVideoUrl) {
                toast.error("Fail to upload video")
                setloadingupload(false);
                return;
            }

            setloadingupload(false);

            const result = await videoTranscriptMutation.mutateAsync({
                url: publicVideoUrl,
                provider,
                model,
            });

            if (result.success) {
                setAnalysisError(false);
                setsummary(result.data?.summary!);
                settimestamps(result.data?.transcription!);
            }
        }
        catch (err: unknown) {
            setAnalysisError(true);
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
    }

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="flex h-[92vh] w-full flex-col bg-background">
                <VideoAnalysisHeader Api={Api} provider={provider} setProvider={setProvider} />
                <ResizablePanelGroup
                    orientation="horizontal"
                    className="w-full">
                    <ResizablePanel defaultSize="50%" minSize="50%" >
                        <div className="flex flex-col h-full w-full justify-between pr-2">
                            <div className="flex-1 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                                <div className="mx-auto max-w-5xl py-5">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="video/*"
                                        className="hidden"
                                    />

                                    {videoSrc ? (
                                        <VideoPlayer
                                            videoSrc={videoSrc}
                                            videoFile={videoFile}
                                            provider={provider}
                                            model={model}
                                            modelList={modelList}
                                            modelsLoading={modelsLoading}
                                            modelOpen={modelOpen}
                                            setModelOpen={setModelOpen}
                                            setModel={setModel}
                                            Api={Api}
                                            isPending={videoTranscriptMutation.isPending}
                                            loadingupload={loadingupload}
                                            onClearVideo={handleClearVideo}
                                            onGenerate={generatetranscript}
                                        />
                                    ) : (
                                        <VideoUploader onContainerClick={handleContainerClick} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle/>
                    <ResizablePanel defaultSize="50%" minSize="50%">
                        <div className="w-full h-full p-6 rounded-xl flex flex-col gap-6 overflow-hidden min-h-100">
                            <VideoAnalysisResult
                                summary={summary}
                                timestamps={timestamps}
                                isPending={videoTranscriptMutation.isPending}
                                loadingupload={loadingupload}
                                analysisError={analysisError}
                                onRetry={generatetranscript}
                            />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div >
        </>
    )
}
