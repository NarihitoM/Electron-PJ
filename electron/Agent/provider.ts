import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenRouter } from "@langchain/openrouter"
import { ChatMistralAI } from "@langchain/mistralai"
import { ChatDeepSeek } from "@langchain/deepseek"
import { ChatOllama } from "@langchain/ollama"
import { toolRegistry, getRegistryKey } from "../tools/toolsregister";
import { agentauth } from "../../src/features/agent/api/api";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

interface Config {
    provider: string,
    model: string,
}

function stripOptionalFields(tools: DynamicStructuredTool[]): DynamicStructuredTool[] {
    return tools.filter((t) => t && t.schema).map((tool) => {
        const schema = tool.schema as z.ZodObject<any>;

        const shape: Record<string, z.ZodTypeAny> = {};
        let modified = false;

        for (const [key, field] of Object.entries(schema.shape)) {
            if (field instanceof z.ZodOptional || field instanceof z.ZodNullable) {
                modified = true;
                let inner = field as z.ZodTypeAny;
                while (inner instanceof z.ZodOptional || inner instanceof z.ZodNullable) {
                    inner = inner.unwrap();
                }
                shape[key] = inner;
            } else {
                shape[key] = field as z.ZodTypeAny;
            }
        }

        if (!modified) return tool;

        const strippedSchema = z.object(shape);
        return new DynamicStructuredTool({
            name: tool.name,
            description: tool.description,
            schema: strippedSchema as any,
            func: tool.func,
        });
    });
}

const createRawLLM = (provider: string, model: string, apiKey: string, host?: string) => {
    switch (provider) {
        case "openai":
            return new ChatOpenAI({ apiKey, model, streaming: true, streamUsage: true });
        case "anthropic":
            return new ChatAnthropic({ anthropicApiKey: apiKey, model, streaming: true, streamUsage: true });
        case "gemini":
            return new ChatGoogleGenerativeAI({ apiKey, model, streaming: true, streamUsage: true });
        case "groq":
            return new ChatGroq({ apiKey, model, streaming: true, streamUsage: true });
        case "openrouter":
            return new ChatOpenRouter({ apiKey, model, streamUsage: true });
        case "mistral":
            return new ChatMistralAI({ apiKey, model, streaming: true, streamUsage: true });
        case "deepseek":
            return new ChatDeepSeek({ apiKey, model, streaming: true, streamUsage: true });
        case "zen":
            return new ChatOpenAI({ apiKey, model, streaming: true, streamUsage: true, configuration: { baseURL: "https://opencode.ai/zen/v1" } });
        case "ollama": {
            const baseUrl = host || (apiKey ? "https://ollama.com" : "http://localhost:11434");
            const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined;
            return new ChatOllama({ model, baseUrl, headers });
        }
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
};

export const createModel = async (
    config: Config,
    keyMap: Record<string, string>,
    useremail: string,
    hostMap?: Record<string, string>,
): Promise<ReturnType<typeof createRawLLM>> => {
    const provider = config.provider.toLowerCase();
    const encryptedHash = keyMap[provider];
    if (!encryptedHash) {
        throw new Error(`No API key found for provider: ${provider}`);
    }
    const data = await agentauth.Decryptkey(encryptedHash, useremail);
    if (!data?.key && !hostMap?.[provider]) throw new Error(`Decrypted key is empty for provider: ${provider}`);

    let host: string | undefined;
    let key = data?.key || "";
    if (hostMap?.[provider]) {
        host = hostMap[provider];
    } else if (provider === "ollama") {
        // Backward compat: old JSON-string in apiKey
        try {
            const parsed = JSON.parse(key);
            host = parsed.host || undefined;
            key = parsed.apiKey || "";
        } catch { /* plain URL or actual API key */ }
    }

    return createRawLLM(provider, config.model, key, host);
};

export const getLLM = async (
    config: Config,
    keyMap: Record<string, string>,
    useremail: string,
    tool: string,
    hostMap?: Record<string, string>,
) => {
    const provider = config.provider.toLowerCase();
    const registryKey = getRegistryKey(tool);
    const selecttool = registryKey ? toolRegistry[registryKey] : toolRegistry[tool];

    const tools = Array.isArray(selecttool) ? selecttool : [selecttool];

    const boundTools = provider === "groq" ? stripOptionalFields(tools) : tools;
    const llm = await createModel(config, keyMap, useremail, hostMap);
    return (llm as any).bindTools(boundTools);
};