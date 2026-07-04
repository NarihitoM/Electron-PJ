import { tool } from "@langchain/core/tools";
import { z } from "zod";

function stripHtml(html: string): string {
    return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function estimateTokens(text: string): number {
    const cleaned = text.trim();
    if (!cleaned) return 0;
    const words = cleaned.split(/\s+/).length;
    return Math.ceil(words * 1.3);
}

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

function countCharacters(text: string, withSpaces: boolean): number {
    return withSpaces ? text.length : text.replace(/\s/g, "").length;
}

function countLines(text: string): number {
    return text.split("\n").length;
}

function countParagraphs(text: string): number {
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
}

export const texttool = tool(
    async ({ action, text, max_length, separator }) => {
        try {
            if (!text && action !== "stats") {
                return "Error: text parameter is required";
            }

            switch (action) {
                case "strip_html": {
                    return stripHtml(text!);
                }

                case "truncate": {
                    const max = max_length || 1000;
                    if (text!.length <= max) return text!;
                    return text!.slice(0, max) + `\n\n... (truncated, ${text!.length - max} chars removed)`;
                }

                case "split": {
                    const sep = separator || "\n\n";
                    const parts = text!.split(sep);
                    const result = parts.map((p, i) => `[${i + 1}/${parts.length}] ${p.trim()}`).join("\n\n");
                    if (result.length > 50000) {
                        return result.slice(0, 50000) + `\n\n... (${parts.length} parts total, result truncated)`;
                    }
                    return result;
                }

                case "stats": {
                    const txt = text || "";
                    return [
                        `Characters (with spaces): ${countCharacters(txt, true)}`,
                        `Characters (no spaces): ${countCharacters(txt, false)}`,
                        `Words: ${countWords(txt)}`,
                        `Sentences: ${countSentences(txt)}`,
                        `Lines: ${countLines(txt)}`,
                        `Paragraphs: ${countParagraphs(txt)}`,
                        `Estimated tokens: ${estimateTokens(txt)}`
                    ].join("\n");
                }

                case "count_tokens": {
                    return `Estimated tokens: ${estimateTokens(text!)}`;
                }

                default:
                    return `Unknown action: ${action}`;
            }
        } catch (err: any) {
            return `Text error: ${err.message}`;
        }
    },
    {
        name: "text_tool",
        description: "Process and analyze text. Actions: strip_html (remove HTML tags), truncate (cut to length), split (divide by separator), stats (word/char/sentence/paragraph/token counts), count_tokens (estimate LLM tokens).",
        schema: z.object({
            action: z.enum(["strip_html", "truncate", "split", "stats", "count_tokens"]).describe("Operation to perform on the text"),
            text: z.string().optional().describe("Input text to process"),
            max_length: z.number().optional().describe("Maximum length for truncate action (default: 1000)"),
            separator: z.string().optional().describe("Separator for split action (default: double newline)")
        })
    }
);
