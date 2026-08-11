import axios from "axios";
import { Server } from "../../../shared/config/axioconfig";
import { returnvideodata, returnvideourl } from "../types/type";

export const videoauth = {
  videotranscript: async (
    url: string,
    provider: string,
    model: string,
  ): Promise<returnvideodata> => {
    const response = await Server.post(
      "video/api/videotranscript",
      { url, provider, model },
      { timeout: 0 },
    );
    return response.data;
  },
  videouploadviasupabase: async (filename: string): Promise<returnvideourl> => {
    const response = await Server.post("video/api/videoupload", {
      filename,
    });
    return response.data;
  },
  videoupload: async (uploadurl: string, videoFile: File): Promise<{ Key: string }> => {
    const response = await axios.put(uploadurl, videoFile, {
      headers: {
        "Content-Type": videoFile.type || "video/mp4",
      },
      timeout: 0,
    });
    return response.data;
  },
};
