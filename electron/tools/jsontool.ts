import { tool } from "@langchain/core/tools";
import { z } from "zod";

function queryJson(data: any, path: string): any {
  const parts = path.replace(/^\./, "").split(".");
  let current = data;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    const arrayMatch = part.match(/^(\w+)?(?:\[(\d+)\])$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      if (key) current = current[key];
      if (index !== undefined) current = current?.[parseInt(index, 10)];
    } else if (part.includes("[")) {
      const [key, rest] = part.split("[");
      const idx = parseInt(rest.replace("]", ""), 10);
      current = current?.[key]?.[idx];
    } else {
      current = current[part];
    }
  }
  return current;
}

export const jsontool = tool(
  async ({ action, json, path, indent, merge_with }) => {
    try {
      switch (action) {
        case "format": {
          const parsed = JSON.parse(json!);
          const formatted = JSON.stringify(parsed, null, indent || 2);
          if (formatted.length > 50000) {
            return (
              formatted.slice(0, 50000) + `\n\n... (${formatted.length - 50000} more chars omitted)`
            );
          }
          return formatted;
        }

        case "validate": {
          try {
            JSON.parse(json!);
            return "Valid JSON";
          } catch {
            return "Invalid JSON";
          }
        }

        case "query": {
          const parsed = JSON.parse(json!);
          const result = queryJson(parsed, path!);
          if (result === undefined) return `Path '${path}' not found`;
          const formatted = JSON.stringify(result, null, 2);
          if (formatted.length > 50000) {
            return (
              formatted.slice(0, 50000) + `\n\n... (${formatted.length - 50000} more chars omitted)`
            );
          }
          return formatted;
        }

        case "merge": {
          const base = JSON.parse(json!);
          const overlay = JSON.parse(merge_with!);
          const merged = { ...base, ...overlay };
          return JSON.stringify(merged, null, indent || 2);
        }

        case "keys": {
          const parsed = JSON.parse(json!);
          if (typeof parsed !== "object" || parsed === null) return "Not an object";
          return Object.keys(parsed).join("\n");
        }

        default:
          return `Unknown action: ${action}`;
      }
    } catch (err: any) {
      return `JSON error: ${err.message}`;
    }
  },
  {
    name: "json_tool",
    description:
      "Process JSON data. Actions: format (pretty-print), validate (check syntax), query (extract by dot-path like 'data.items[0].name'), merge (merge two objects), keys (list top-level keys).",
    schema: z.object({
      action: z
        .enum(["format", "validate", "query", "merge", "keys"])
        .describe("Operation to perform on the JSON data"),
      json: z.string().describe("The JSON string to process").optional(),
      path: z
        .string()
        .optional()
        .describe("Dot-notation path for query action, e.g. 'data.items[0].name'"),
      indent: z.number().optional().describe("Indentation spaces for format/merge (default: 2)"),

      merge_with: z
        .string()
        .optional()
        .describe("Second JSON string to merge with the first (for merge action)"),
    }),
  },
);
