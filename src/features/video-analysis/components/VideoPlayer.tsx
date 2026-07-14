import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { RefreshCw, ChevronsUpDown, Search } from "lucide-react";
import { getProviderImage } from "@/shared/config/providermodels";
import { videoauthstore } from "@/features/video-analysis/store/store";

export const VideoPlayer = () => {
  const [modelSearch, setModelSearch] = useState("");
  const {
    videoSrc,
    videoFile,
    provider,
    model,
    modelList,
    modelsLoading,
    modelOpen,
    Api,
    isPending,
    loadingupload,
    setmodelOpen,
    setModel,
    generateTranscript,
    handleClearVideo,
  } = videoauthstore();

  return (
    <div className="relative w-full h-full flex flex-col group gap-4">
      <video
        src={videoSrc!}
        controls
        className="rounded-lg w-full h-80 border dark:border-muted-foreground bg-black"
      />
      <div className="w-full flex flex-col gap-3 border-t dark:border-zinc-800 pt-3 px-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm min-w-0 flex-1 truncate">
            <span
              className="font-medium text-zinc-900 dark:text-zinc-100 truncate"
              title={videoFile?.name}
            >
              {videoFile?.name}
            </span>
            <span className="shrink-0">{(videoFile?.size! / (1024 * 1024)).toFixed(1)} MB</span>
            <span className="shrink-0 uppercase bg-cyan-500 dark:bg-white px-1.5 py-0.5 rounded text-[10px] font-sans font-bold text-white dark:text-black border border-transparent">
              {videoFile?.type.split("/")[1] || "video"}
            </span>
          </div>
        </div>
      </div>
      {Api.length > 0 && (
        <div className="relative overflow-visible px-2 w-72">
          <Button
            variant="outline"
            onClick={() => setmodelOpen(!modelOpen)}
            className="w-full justify-between"
            disabled={!provider || modelsLoading}
          >
            {modelsLoading ? (
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : model ? (
              <div className="flex items-center gap-2">
                <img
                  src={getProviderImage(provider || "")}
                  className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                />
                <span className="truncate">{model}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select Model</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
          {modelOpen && (
            <div className="absolute left-2 right-2 bottom-full mb-1 z-100 min-w-full rounded-lg border bg-popover text-popover-foreground shadow-md">
              <div className="flex items-center gap-2 border-b px-3 py-2">
                <Search className="h-4 w-4 shrink-0 opacity-50" />
                <input
                  autoFocus
                  placeholder="Search model..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {modelList.length === 0 && !modelsLoading && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No models available.
                  </div>
                )}
                {modelList.filter((entry) =>
                  entry.model.toLowerCase().includes(modelSearch.toLowerCase()),
                ).length === 0 && modelList.length > 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No model found.</p>
                ) : (
                  modelList
                    .filter((entry) =>
                      entry.model.toLowerCase().includes(modelSearch.toLowerCase()),
                    )
                    .map((entry) => (
                      <button
                        key={entry.model}
                        type="button"
                        onClick={() => {
                          setModel(entry.model);
                          setmodelOpen(false);
                          setModelSearch("");
                        }}
                        className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                      >
                        <img
                          src={getProviderImage(provider || "")}
                          className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                        />
                        <span className="text-sm ml-3 whitespace-nowrap">{entry.model}</span>
                      </button>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex px-2 gap-2">
        <Button onClick={(e) => handleClearVideo?.(e)} className="flex bg-cyan-500 dark:bg-white">
          <RefreshCw size={13} />
          Change Video
        </Button>
        {Api.length > 0 && (
          <Button
            onClick={() => generateTranscript?.()}
            disabled={isPending || loadingupload || !model || !provider}
            className="bg-cyan-500 dark:bg-white"
          >
            {isPending || loadingupload ? (
              <>
                <Spinner />
                {loadingupload ? "Uploading" : "Generating transcript and summary"}
              </>
            ) : (
              "Generate"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
