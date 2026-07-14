export const extractToolMessage = (query: unknown): string | null => {
  if (!query) return null;
  if (typeof query === "string") return query;
  if (typeof query === "object") {
    const contentFields = [
      "message",
      "content",
      "body",
      "query",
      "text",
      "prompt",
      "input",
      "description",
    ];
    for (const field of contentFields) {
      const val = (query as Record<string, unknown>)[field];
      if (typeof val === "string" && val.length > 0) return val;
    }
    for (const val of Object.values(query as Record<string, unknown>)) {
      if (typeof val === "string" && val.length > 0) return val;
    }
  }
  return null;
};

export const getToolBadgeText = (
  tool: { name: string; query: unknown },
  toolMap: Record<string, string>,
): string => {
  const label = toolMap[tool.name.toLowerCase()] || tool.name;
  const msg = extractToolMessage(tool.query);
  return msg ? `${label}: ${msg}` : label;
};
