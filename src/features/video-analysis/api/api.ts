import { Server } from "../../../shared/config/axioconfig";
import { returnvideodata, returnvideourl } from "../types/type";

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
  videoupload: async (videoFile: File): Promise<returnvideourl> => {
    const form = new FormData();
    form.append("video", videoFile);
    const response = await Server.post("video/api/videoupload", form);
    return response.data;
  },
};
