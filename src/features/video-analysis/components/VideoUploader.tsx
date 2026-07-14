import { Video, UploadCloud } from "lucide-react";
import { videoauthstore } from "@/features/video-analysis/store/store";

export const VideoUploader = () => {
  const { handleContainerClick } = videoauthstore();

  return (
    <div
      onClick={() => handleContainerClick?.()}
      className="w-full h-[50vh] border-2 border-dashed border-cyan-500 dark:border-muted-foreground rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 group gap-4"
    >
      <div className="p-4 border border-cyan-500 dark:border-white rounded-full group-hover:scale-110 text-cyan-500 dark:text-white group-hover:text-blue-400 transition-all shadow-md">
        <Video size={32} className="hidden group-hover:block animate-pulse" />
        <UploadCloud size={32} className="block group-hover:hidden" />
      </div>
      <div>
        <h3 className="font-semibold text-xl">Upload your video</h3>
        <p className="text-sm mt-1 max-w-60 mx-auto text-muted-foreground leading-relaxed">
          Click here to upload video. Accepts any standard video container layer formats and file
          size up to 50mb.
        </p>
      </div>
    </div>
  );
};
