import { useRef, useEffect } from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/shared/components/ui/resizable";
import { Toaster } from "@/shared/components/ui/sonner";
import { useVideoTranscript } from "@/features/video-analysis/hooks/useVideoTranscript";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { getProviderModels } from "@/shared/config/providermodels";
import { videoauth } from "@/features/video-analysis/api/api";
import { toast } from "sonner";
import { videoauthstore } from "@/features/video-analysis/store/store";
import { VideoAnalysisHeader } from "./VideoAnalysisHeader";
import { VideoUploader } from "./VideoUploader";
import { VideoPlayer } from "./VideoPlayer";
import { VideoAnalysisResult } from "./VideoAnalysisResult";

export const VideoAnalysisChat = () => {
  const videoTranscriptMutation = useVideoTranscript();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const store = videoauthstore();
  const { provider, videoSrc } = store;
  const { data: ApiKeys = [] } = useServiceKeys();

  useEffect(() => {
    if (ApiKeys.length > 0) {
      store.setApi(ApiKeys);
    }
  }, [ApiKeys]);

  useEffect(() => {
    store.setisPending(videoTranscriptMutation.isPending);
  }, [videoTranscriptMutation.isPending]);

  useEffect(() => {
    if (!provider) {
      store.setmodelList([]);
      return;
    }
    store.setmodelsLoading(true);
    getProviderModels(provider).then((models) => {
      const currentModel = videoauthstore.getState().model;
      store.setmodelList(models);
      store.setmodelsLoading(false);
      if (models.length > 0 && !models.some((m) => m.model === currentModel)) {
        store.setModel(models[0].model);
      }
    });
  }, [provider]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Please Upload file size up to 50mb.");
        return;
      }
      store.setVideoFile(file);
      store.setVideoSrc(URL.createObjectURL(file));
    } else if (file) {
      alert("Please select a valid video format file.");
    }
  };

  const handleClearVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentSrc = videoauthstore.getState().videoSrc;
    if (currentSrc) URL.revokeObjectURL(currentSrc);
    store.setVideoSrc(null);
    store.setVideoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleContainerClick = () => {
    if (!videoauthstore.getState().videoSrc) {
      fileInputRef.current?.click();
    }
  };

  const generatetranscript = async () => {
    const state = videoauthstore.getState();
    if (!state.provider || !state.model) {
      toast.error("Please select a provider and model first.");
      return;
    }
    try {
      store.setsummary(null);
      store.settimestamps([]);
      store.setloadingupload(true);
      const response = await videoauth.videouploadviasupabase(state.videoFile?.name!);
      const uploadurl = response.data?.uploadUrl;
      if (!uploadurl) {
        toast.error("Fail to upload video");
        store.setloadingupload(false);
        return;
      }
      const data = await videoauth.videoupload(uploadurl!, state.videoFile);
      if (!data || !data.Key) {
        toast.error("File is too large. Allowed only up to 50mb");
        store.setloadingupload(false);
        return;
      }
      const key = data.Key;
      const supabaseUrl = import.meta.env.VITE_SUPABASE || "";
      const publicVideoUrl = `${supabaseUrl}/storage/v1/object/public/${key}`;
      if (!publicVideoUrl) {
        toast.error("Fail to upload video");
        store.setloadingupload(false);
        return;
      }
      store.setloadingupload(false);
      const result = await videoTranscriptMutation.mutateAsync({
        url: publicVideoUrl,
        provider: state.provider,
        model: state.model,
      });
      if (result.success) {
        store.setanalysisError(false);
        store.setsummary(result.data?.summary!);
        store.settimestamps(result.data?.transcription!);
      }
    } catch (err: unknown) {
      store.setanalysisError(true);
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    store.registerHandlers({
      generateTranscript: generatetranscript,
      handleClearVideo: handleClearVideo as (e: React.MouseEvent) => void,
      handleContainerClick,
    });
  }, []);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex h-[92vh] w-full flex-col bg-background">
        <VideoAnalysisHeader />
        <ResizablePanelGroup orientation="horizontal" className="w-full">
          <ResizablePanel defaultSize="50%" minSize="50%">
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
                  {videoSrc ? <VideoPlayer /> : <VideoUploader />}
                </div>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="50%" minSize="50%">
            <div className="w-full h-full p-6 rounded-xl flex flex-col gap-6 overflow-hidden min-h-100">
              <VideoAnalysisResult />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
};
