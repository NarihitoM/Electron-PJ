import { Server } from "../config/axioconfig"
import { datafetch } from "../config/tanstackqueryconfig"

export interface ModelPricing {
    input: number;   // $/1M tokens
    output: number;  // $/1M tokens
}

export interface ModelEntry {
    model: string;
    capabilities: string[];
    pricing?: ModelPricing;
}

function inferCapabilities(id: string): string[] {
    const lower = id.toLowerCase();
    const caps: string[] = ["text"];
    if (/vl|vision|image|multimodal|visual|pixtral|sonnet|opus|haiku|gpt-4|gpt-5|gemini|claude/.test(lower)) caps.push("vision");
    if (/code|coder|codex|devstral|programming|starcoder|deepseek|qwen-coder|laguna|cobuddy/.test(lower)) caps.push("code");
    if (/reason|think|o1|o3|o4|deepseek|nemotron.*reasoning|lfm.*thinking/.test(lower)) caps.push("reasoning");
    if (/gpt|claude|gemini|mistral-large|mistral-medium|devstral|open-mistral|function|tool/.test(lower)) caps.push("tools");
    return caps;
}

function ensureCapabilities(entry: ModelEntry): ModelEntry {
    if (entry.capabilities.length === 0) {
        return { ...entry, capabilities: inferCapabilities(entry.model) };
    }
    return entry;
}

let modelCache: Record<string, { models: ModelEntry[]; timestamp: number }> = {};
const CACHE_TTL = 60 * 60 * 1000;

const EMPTY: ModelEntry[] = [];

export const fetchModelsForProvider = async (provider: string): Promise<ModelEntry[]> => {
    const lower = provider.toLowerCase();
    const cached = modelCache[lower];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.models;
    }

    if (lower === "ollama") {
        let models: ModelEntry[] = [];
        try {
            const response = await Server.get(`/model/api/models/${lower}`);
            const data = response.data?.data;
            if (Array.isArray(data)) {
                models = data.map((m: any) =>
                    typeof m === "string"
                        ? { model: m, capabilities: [] }
                        : { model: m.model ?? m.id ?? m.name ?? "", capabilities: m.capabilities ?? [], pricing: m.pricing }
                ).map(ensureCapabilities);
            }
        } catch (err) {
            console.error(`Server model fetch failed for ${lower}:`, (err as any)?.message || err);
        }

        if (models.length === 0) {
            try {
                if (typeof window !== "undefined" && (window as any).api?.fetchOllamaModels) {
                    const cached = datafetch.getQueryData<{ id: number; provider: string; apiKey: string; host?: string }[]>(["key"]);
                    const stored = cached?.find(
                        s => s.provider.toLowerCase() === "ollama"
                    );
                    let baseUrl: string | undefined;
                    let apiKey: string | undefined;
                    if (stored) {
                        if (stored.host) {
                            baseUrl = stored.host;
                            apiKey = stored.apiKey || undefined;
                        } else {
                            try {
                                const parsed = JSON.parse(stored.apiKey);
                                baseUrl = parsed.host;
                                apiKey = parsed.apiKey;
                            } catch { baseUrl = stored.apiKey; }
                        }
                    }
                    const names = await (window as any).api.fetchOllamaModels(baseUrl, apiKey);
                    models = (names || []).map((n: string) => ({ model: n, capabilities: [] })).map(ensureCapabilities);
                }
            } catch (err) {
                console.error(`Electron bridge model fetch failed for ollama:`, (err as any)?.message || err);
            }
        }

        if (models.length > 0) {
            modelCache[lower] = { models, timestamp: Date.now() };
        }
        return models;
    }

    try {
        const response = await Server.get(`/model/api/models/${lower}`);
        const data = response.data?.data;
        const models: ModelEntry[] = Array.isArray(data)
            ? data.map((m: any) =>
                typeof m === "string"
                    ? { model: m, capabilities: [] }
                    : { model: m.model ?? m.id ?? m.name ?? "", capabilities: m.capabilities ?? [], pricing: m.pricing }
            ).map(ensureCapabilities)
            : [];
        modelCache[lower] = { models, timestamp: Date.now() };
        return models;
    } catch {
        return EMPTY;
    }
};

export const clearModelCache = (provider?: string) => {
    if (provider) {
        delete modelCache[provider.toLowerCase()];
    } else {
        modelCache = {};
    }
};