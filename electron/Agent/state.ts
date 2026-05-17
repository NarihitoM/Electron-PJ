import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { agentsession } from "@/types/agenttype";

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  input: Annotation<agentsession[]>({
    reducer: (x, y) => (y.length > 0 ? y : x),
    default: () => [],
  }),
  error: Annotation<string | null>({
    reducer: (_, y) => y,
    default: () => null,
  }),
  retryCount: Annotation<number>({
    reducer: (_, y) => y,
    default: () => 0,
  }),
  activeagent : Annotation<string>({
    reducer : (_,y) => y,
    default : () => ""
  })
});