import { useMutation } from "@tanstack/react-query";
import { githubauth } from "../api/api";

export const useSendGithubMessage = () => {
  return useMutation({
    mutationFn: (params: {
      content: string;
      provider: string;
      model: string;
      id: string;
      name: string;
      type: string;
      images?: string[];
      onChunk: (chunk: string) => void;
      onThinking?: (chunk: string) => void;
      onStatus?: (status: {
        type: string;
        step: string;
        tool?: string;
        name?: string;
        input?: string;
        output?: string;
        id: string;
        query: string;
        result: string;
        error: string;
      }) => void;
      onApproval?: (approval: {
        thread_id: string;
        tool_calls: Array<{ name: string; query: any; id: string }>;
      }) => void;
      onImage?: (url: string) => void;
      signal?: AbortSignal;
      reasoningLevel?: "" | "low" | "medium" | "high";
    }) =>
      githubauth.sendmessage(
        params.content,
        params.provider,
        params.model,
        params.id,
        params.name,
        params.type,
        params.images,
        params.onChunk,
        params.onThinking,
        params.onStatus,
        params.onApproval,
        params.onImage,
        params.signal,
        params.reasoningLevel,
      ),
  });
};
