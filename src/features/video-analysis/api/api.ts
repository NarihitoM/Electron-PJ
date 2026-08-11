import { Upload as TusUpload } from "tus-js-client";
import { Server } from "../../../shared/config/axioconfig";
import { returnvideodata, returnvideourl } from "../types/type";

const SUPABASE_BUCKET = "Multimatevideo";

export const videoauth = {
  videotranscript: async (
    url: string,
    provider: string,
    model: string,
  ): Promise<returnvideodata> => {
    const response = await Server.post("video/api/videotranscript", {
      url,
      provider,
      model,
    });
    return response.data;
  },
  videouploadviasupabase: async (filename: string): Promise<returnvideourl> => {
    const response = await Server.post("video/api/videoupload", {
      filename,
    });
    return response.data;
  },
  // Signed-URL simple PUT times out on Supabase for videos past a few MB —
  // resumable (TUS) upload is what Supabase itself recommends for this size.
  videoupload: (path: string, token: string, videoFile: File): Promise<void> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE || "";
    return new Promise((resolve, reject) => {
      const upload = new TusUpload(videoFile, {
        endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
        retryDelays: [0, 1000, 3000, 5000],
        headers: {
          authorization: `Bearer ${token}`,
          "x-upsert": "true",
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: SUPABASE_BUCKET,
          objectName: path,
          contentType: videoFile.type || "video/mp4",
          cacheControl: "3600",
        },
        chunkSize: 6 * 1024 * 1024,
        onError: reject,
        onSuccess: () => resolve(),
      });
      upload.start();
    });
  },
};
