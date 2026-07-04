import { useMutation } from "@tanstack/react-query"
import { videoauth } from "../api/api"

export const useVideoTranscript = () => {
    return useMutation({
        mutationFn: ({ url, provider, model }: { url: string; provider: string; model: string }) =>
            videoauth.videotranscript(url, provider, model),
    })
}
