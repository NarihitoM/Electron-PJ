import axios from "axios";

export async function fetchOllamaModels(baseUrl?: string, apiKey?: string): Promise<string[]> {
  try {
    const resolved = baseUrl || (apiKey ? "https://ollama.com" : "http://localhost:11434");
    const url = `${resolved.replace(/\/+$/, "")}/api/tags`;
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }
    const response = await axios.get(url, { headers, timeout: 15000 });
    const data = response.data;
    if (!data?.models || !Array.isArray(data.models)) return [];
    return data.models.map((m: any) => m.name).filter(Boolean);
  } catch (err) {
    console.error(
      `fetchOllamaModels error for ${baseUrl || "(default)"}:`,
      (err as any)?.message || err,
    );
    return [];
  }
}
