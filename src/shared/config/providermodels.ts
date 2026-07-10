import Gemini from "../assets/gemini.png"
import Anthropic from "../assets/claude.png"
import Groq from "../assets/groq.png"
import OpenAi from "../assets/openai.png"
import OpenRouter from "../assets/openrouter.png"
import Mistral from "../assets/mistralai.png"
import Deepseek from "../assets/deepseek.png"
import Ollama from "../assets/ollama.png"
import ZAI from "../assets/zai.svg"
import MultimateLogo from "../assets/Multimate.png"
import { fetchModelsForProvider, clearModelCache, type ModelEntry } from "../lib/modelsapi";

export const BRAND_ASSETS: Record<string, string> = {
    groq: Groq,
    openai: OpenAi,
    anthropic: Anthropic,
    gemini: Gemini,
    openrouter: OpenRouter,
    mistral: Mistral,
    deepseek : Deepseek,
    ollama: Ollama,
    zai: ZAI,
    zen: MultimateLogo
};

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    gemini: "Gemini",
    groq: "Groq",
    openrouter: "OpenRouter",
    mistral: "Mistral",
    deepseek: "DeepSeek",
    ollama: "Ollama",
    zai: "Z.AI",
    zen: "MultimateAi",
};

export const getProviderDisplayName = (provider: string) =>
    PROVIDER_DISPLAY_NAMES[provider.toLowerCase()] || provider.charAt(0).toUpperCase() + provider.slice(1);


export const PROVIDER = [
    {
        name: "OpenAI",
        model: "GPT Series",
        image: BRAND_ASSETS["openai"],
        description:
            "Powerful multimodal AI for chat, coding and reasoning."
    },
    {
        name: "Anthropic",
        model: "Claude Series",
        image: BRAND_ASSETS["anthropic"],
        description:
            "Long-context models focused on analysis and coding."
    },
    {
        name: "Google Gemini",
        model: "Gemini Series",
        image: BRAND_ASSETS["gemini"],
        description:
            "Fast multimodal AI with search integration."
    },
    {
        name: "Groq",
        model: "Ultra-fast inference",
        image: BRAND_ASSETS["groq"],
        description:
            "Very low-latency AI responses for real-time apps."
    },
    {
        name: "OpenRouter",
        model: "Unified AI Gateway For All Providers",
        image: BRAND_ASSETS["openrouter"],
        description:
            "Access multiple leading AI models through a single API including OpenAI, Anthropic, Gemini, Nvidia and more."
    },
    {
        name: "Mistral",
        model: "Mistral Series",
        image: BRAND_ASSETS["mistral"],
        description:
            "High-performance open-weight language models optimized for fast inference, reasoning, and multilingual tasks."
    },
    {
        name: "Deepseek",
        model: "DeepSeek V4 Series",
        image: BRAND_ASSETS["deepseek"],
        description:
            "Highly efficient mixture-of-experts (MoE) models featuring a massive 1M context window and advanced thinking architectures for complex reasoning, coding, and multi-agent workflows."
    },
    {
        name: "Ollama",
        model: "Local LLMs",
        image: BRAND_ASSETS["ollama"],
        description:
            "Run open-source large language models locally on your machine. Supports Llama, Mistral, Qwen, DeepSeek and hundreds of models."
    },
    {
        name: "Z.AI",
        model: "GLM Series",
        image: BRAND_ASSETS["zai"],
        description:
            "Advanced open-weight GLM models optimized for reasoning, coding, and multimodal tasks. Powered by Zhipu AI."
    },
    {
        name: "MultimateAi (Free)",
        model: "Free Tier",
        image: BRAND_ASSETS["zen"],
        description:
            "Server-side free AI models. Uses your credit balance — 50 free credits monthly. No API key required."
    }
]


export const PROVIDER_MODELS: Record<string, { model: string; imageUrl: string }[]> = {
    groq: [
        { model: "openai/gpt-oss-120b", imageUrl: Groq },
        { model: "openai/gpt-oss-safeguard-20b", imageUrl: Groq },
        { model: "qwen/qwen3-32b", imageUrl: Groq },
        { model: "llama-3.1-8b-instant", imageUrl: Groq },
        { model: "llama-3.3-70b-versatile", imageUrl: Groq },
        { model: "meta-llama/llama-4-scout-17b-16e-instruct", imageUrl: Groq },
    ],
    openai: [
        { model: "gpt-5.5", imageUrl: OpenAi },
        { model: "gpt-5.5-instant", imageUrl: OpenAi },
        { model: "gpt-5.4", imageUrl: OpenAi },
        { model: "gpt-5.4-mini", imageUrl: OpenAi },
        { model: "gpt-5.4-nano", imageUrl: OpenAi },
        { model: "o4-mini", imageUrl: OpenAi },
        { model: "o3", imageUrl: OpenAi },
        { model: "o3-pro", imageUrl: OpenAi },
        { model: "gpt-4o", imageUrl: OpenAi },
        { model: "gpt-4o-mini", imageUrl: OpenAi },
        { model: "gpt-4-turbo", imageUrl: OpenAi }
    ],
    anthropic: [
        { model: "claude-opus-4-7", imageUrl: Anthropic },
        { model: "claude-opus-4-6", imageUrl: Anthropic },
        { model: "claude-sonnet-4-6", imageUrl: Anthropic },
        { model: "claude-opus-4-5-20251101", imageUrl: Anthropic },
        { model: "claude-opus-4-1-20250805", imageUrl: Anthropic },
        { model: "claude-sonnet-4-20250514", imageUrl: Anthropic },
        { model: "claude-opus-4-20250514", imageUrl: Anthropic },
        { model: "claude-3-5-haiku-20241022", imageUrl: Anthropic },
        { model: "claude-3-5-sonnet-20241022", imageUrl: Anthropic },
        { model: "claude-3-5-sonnet-20240620", imageUrl: Anthropic },
        { model: "claude-3-haiku-20240307", imageUrl: Anthropic },
        { model: "claude-3-opus-20240229", imageUrl: Anthropic },
        { model: "claude-3-sonnet-20240229", imageUrl: Anthropic },
    ],
    gemini: [
        { model: "gemini-3.5-flash", imageUrl: Gemini },
        { model: "gemini-3.1-pro-preview", imageUrl: Gemini },
        { model: "gemini-3-flash-preview", imageUrl: Gemini },
        { model: "gemini-3.1-flash-lite-preview", imageUrl: Gemini },
        { model: "gemini-2.5-pro", imageUrl: Gemini },
        { model: "gemini-2.5-flash", imageUrl: Gemini },
        { model: "gemini-2.5-flash-lite", imageUrl: Gemini },
    ],
    openrouter: [
        { model: "nvidia/nemotron-3-super-120b-a12b:free", imageUrl: OpenRouter },
        { model: "poolside/laguna-m.1:free", imageUrl: OpenRouter },
        { model: "openai/gpt-oss-120b:free", imageUrl: OpenRouter },
        { model: "nvidia/nemotron-3-nano-30b-a3b:free", imageUrl: OpenRouter },
        { model: "poolside/laguna-xs.2:free", imageUrl: OpenRouter },
        { model: "openai/gpt-oss-20b:free", imageUrl: OpenRouter },
        { model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", imageUrl: OpenRouter },
        { model: "nvidia/nemotron-nano-12b-v2-vl:free", imageUrl: OpenRouter },
        { model: "baidu/cobuddy:free", imageUrl: OpenRouter },
        { model: "liquid/lfm-2.5-1.2b-thinking:free", imageUrl: OpenRouter },
        { model: "meta-llama/llama-3.3-70b-instruct:free", imageUrl: OpenRouter },
        { model: "google/gemma-4-31b-it:free", imageUrl: OpenRouter },
        { model: "qwen/qwen3-coder:free", imageUrl: OpenRouter },
        { model: "qwen/qwen3-next-80b-a3b-instruct:free", imageUrl: OpenRouter },
        { model: "openrouter/free", imageUrl: OpenRouter },
    ],
    mistral: [
        { model: "mistral-large-2512", imageUrl: Mistral },
        { model: "mistral-medium-3-5", imageUrl: Mistral },
        { model: "mistral-small-2603", imageUrl: Mistral },
        { model: "mistral-medium-2508", imageUrl: Mistral },
        { model: "ministral-14b-2512", imageUrl: Mistral },
        { model: "ministral-8b-2512", imageUrl: Mistral },
        { model: "ministral-3b-2512", imageUrl: Mistral },
        { model: "open-mistral-nemo-2407", imageUrl: Mistral },
        { model: "devstral-2512", imageUrl: Mistral },
    ],
    deepseek: [
        { model: "deepseek-v4-flash", imageUrl: Deepseek },
        { model: "deepseek-v4-pro", imageUrl: Deepseek }
    ],
    ollama: [
        { model: "llama3.2", imageUrl: Ollama },
        { model: "llama3.1", imageUrl: Ollama },
        { model: "llama3", imageUrl: Ollama },
        { model: "mistral", imageUrl: Ollama },
        { model: "qwen2.5", imageUrl: Ollama },
        { model: "deepseek-r1", imageUrl: Ollama },
        { model: "gemma3", imageUrl: Ollama },
        { model: "phi4", imageUrl: Ollama },
        { model: "codellama", imageUrl: Ollama },
        { model: "mixtral", imageUrl: Ollama },
        { model: "nomic-embed-text", imageUrl: Ollama }
    ],
    zai: [
        { model: "glm-5.2", imageUrl: ZAI },
        { model: "glm-5.1", imageUrl: ZAI },
        { model: "glm-5", imageUrl: ZAI },
        { model: "glm-5-turbo", imageUrl: ZAI },
        { model: "glm-5v-turbo", imageUrl: ZAI },
        { model: "glm-4.7", imageUrl: ZAI },
        { model: "glm-4.7-flash", imageUrl: ZAI },
        { model: "glm-4.7-flashx", imageUrl: ZAI },
        { model: "glm-4.6", imageUrl: ZAI },
        { model: "glm-4.6v", imageUrl: ZAI },
        { model: "glm-4.5", imageUrl: ZAI },
        { model: "glm-4.5-air", imageUrl: ZAI },
        { model: "glm-4.5-flash", imageUrl: ZAI },
        { model: "glm-4.5v", imageUrl: ZAI },
    ],
    zen: [
        { model: "deepseek-v4-flash-free", imageUrl: MultimateLogo },
        { model: "mimo-v2.5-free", imageUrl: MultimateLogo },
        { model: "north-mini-code-free", imageUrl: MultimateLogo },
        { model: "nemotron-3-ultra-free", imageUrl: MultimateLogo },
        { model: "big-pickle", imageUrl: MultimateLogo },
    ]
};

let dynamicModelCache: Record<string, { models: ModelEntry[]; timestamp: number }> = {};
const DYNAMIC_CACHE_TTL = 60 * 60 * 1000;

export function clearDynamicModelCache(provider?: string) {
    if (provider) {
        delete dynamicModelCache[provider.toLowerCase()];
    } else {
        dynamicModelCache = {};
    }
}

const wrappedClearModelCache = (provider?: string) => {
    clearModelCache(provider);
    clearDynamicModelCache(provider);
};

export { wrappedClearModelCache as clearModelCache };

export async function getProviderModels(provider: string): Promise<ModelEntry[]> {
    const lower = provider.toLowerCase();

    const dynCached = dynamicModelCache[lower];
    if (dynCached && Date.now() - dynCached.timestamp < DYNAMIC_CACHE_TTL) {
        return dynCached.models;
    }

    const fetched = await fetchModelsForProvider(lower);
    if (fetched.length > 0) {
        dynamicModelCache[lower] = { models: fetched, timestamp: Date.now() };
        return fetched;
    }

    const fallback = PROVIDER_MODELS[lower];
    if (fallback) {
        return fallback.map(m => ({ model: m.model, capabilities: inferCapabilities(m.model) }));
    }

    return [];
}

function inferCapabilities(id: string): string[] {
    const lower = id.toLowerCase();
    const caps: string[] = ["text"];
    if (/vl|vision|image|multimodal|visual|pixtral|sonnet|opus|haiku|glm.*v[^a-z]|gpt-4|gpt-5|gemini|claude/.test(lower)) caps.push("vision");
    if (/code|coder|codex|devstral|programming|starcoder|deepseek|qwen-coder|laguna|cobuddy/.test(lower)) caps.push("code");
    if (/reason|think|o1|o3|o4|glm-5[.\d]|deepseek|nemotron.*reasoning|lfm.*thinking/.test(lower)) caps.push("reasoning");
    if (/gpt|claude|gemini|glm[.\-\d]|mistral-large|mistral-medium|devstral|open-mistral|function|tool/.test(lower)) caps.push("tools");
    return caps;
}

export function getProviderImage(provider: string): string {
    return BRAND_ASSETS[provider.toLowerCase()] || "";
}
