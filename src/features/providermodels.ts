import Gemini from "../../src/assets/gemini.png"
import Anthropic from "../../src/assets/claude.png"
import Groq from "../../src/assets/groq.png"
import OpenAi from "../../src/assets/openai.png"
import OpenRouter from "../../src/assets/openrouter.png"
import Mistral from "../../src/assets/mistralai.png"

export const BRAND_ASSETS: Record<string, any> = {
    groq: Groq,
    openai: OpenAi,
    anthropic: Anthropic,
    gemini: Gemini,
    openrouter: OpenRouter,
    mistral: Mistral
};


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
    }
]


export const PROVIDER_MODELS: Record<string, { model: string; imageUrl: any }[]> = {
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
        { model: "claude-sonnet-4-6", imageUrl: Anthropic },
        { model: "claude-haiku-4-5", imageUrl: Anthropic },
        { model: "claude-3-7-sonnet-latest", imageUrl: Anthropic },
        { model: "claude-3-5-sonnet-latest", imageUrl: Anthropic },
        { model: "claude-3-opus-latest", imageUrl: Anthropic }
    ],
    gemini: [
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
    ]
};
