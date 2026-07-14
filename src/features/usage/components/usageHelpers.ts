export const AGENT_COLORS = [
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#ec4899",
  "#6366f1",
];

export const formatNumber = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
};

export const formatCost = (n: number) => {
  if (n < 0.01) return "<$0.01";
  return "$" + n.toFixed(2);
};

export const formatLatency = (ms: number) => {
  if (ms >= 1000) return (ms / 1000).toFixed(1) + "s";
  return ms + "ms";
};

export const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
  groq: "Groq",
  openrouter: "OpenRouter",
  mistral: "Mistral",
  deepseek: "DeepSeek",
  zen: "MultimateAi",
};

export const AGENT_LABELS: Record<string, string> = {
  chat: "Chat",
  telegram: "Telegram",
  slack: "Slack",
  notion: "Notion",
  googlesheet: "Google Sheets",
  googledocs: "Google Docs",
  video: "Video",
  webscrap: "Web Scraping",
};
