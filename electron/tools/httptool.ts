import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dns from "dns/promises";

const BLOCKED_IPS = new Set([
    "127.0.0.1", "0.0.0.0", "255.0.0.0", "255.255.255.255",
    "::1", "localhost",
]);

const BLOCKED_RANGES: Array<{ start: number; end: number }> = [
    { start: ipToNum("10.0.0.0"), end: ipToNum("10.255.255.255") },
    { start: ipToNum("172.16.0.0"), end: ipToNum("172.31.255.255") },
    { start: ipToNum("192.168.0.0"), end: ipToNum("192.168.255.255") },
    { start: ipToNum("100.64.0.0"), end: ipToNum("100.127.255.255") },
    { start: ipToNum("198.18.0.0"), end: ipToNum("198.19.255.255") },
    { start: ipToNum("169.254.0.0"), end: ipToNum("169.254.255.255") },
    { start: ipToNum("192.0.0.0"), end: ipToNum("192.0.0.255") },
    { start: ipToNum("192.0.2.0"), end: ipToNum("192.0.2.255") },
    { start: ipToNum("198.51.100.0"), end: ipToNum("198.51.100.255") },
    { start: ipToNum("203.0.113.0"), end: ipToNum("203.0.113.255") },
    { start: ipToNum("224.0.0.0"), end: ipToNum("239.255.255.255") },
];

function ipToNum(ip: string): number {
    const parts = ip.split(".").map(Number);
    return ((parts[0] || 0) << 24) | ((parts[1] || 0) << 16) | ((parts[2] || 0) << 8) | (parts[3] || 0);
}

function isBlockedIp(ip: string): boolean {
    const normalized = ip.replace(/^::ffff:/, "");
    if (BLOCKED_IPS.has(normalized)) return true;

    if (normalized.includes(":")) return true;

    const num = ipToNum(normalized);
    return BLOCKED_RANGES.some(r => num >= r.start && num <= r.end);
}

async function validateAndResolve(url: string): Promise<{ ok: boolean; error?: string }> {
    try {
        const parsed = new URL(url);

        if (!["https:", "http:"].includes(parsed.protocol)) {
            return { ok: false, error: "Only http and https URLs are allowed." };
        }

        const hostname = parsed.hostname.toLowerCase();
        if (BLOCKED_IPS.has(hostname)) {
            return { ok: false, error: "Requests to localhost/internal IPs are blocked." };
        }

        if (hostname.includes(":")) {
            return { ok: false, error: "IPv6 addresses are blocked." };
        }

        const addresses = await dns.resolve4(hostname).catch(() => []);
        if (addresses.length === 0) {
            return { ok: false, error: "DNS resolution failed." };
        }

        for (const addr of addresses) {
            if (isBlockedIp(addr)) {
                return { ok: false, error: "Requests to private/internal IPs are blocked." };
            }
        }

        return { ok: true };
    } catch {
        return { ok: false, error: "Invalid URL." };
    }
}

export const httptool = tool(
    async ({ url, method, headers, body, timeout }) => {
        try {
            const validation = await validateAndResolve(url);
            if (!validation.ok) {
                return `Error: ${validation.error}`;
            }

            const controller = new AbortController();
            const timeoutMs = Math.min(timeout || 30000, 60000);
            const timer = setTimeout(() => controller.abort(), timeoutMs);

            const fetchHeaders: Record<string, string> = {
                "User-Agent": "MultimateAgent/1.0",
                ...(headers || {})
            };

            const fetchOptions: RequestInit = {
                method: method || "GET",
                headers: fetchHeaders,
                signal: controller.signal
            };

            if (body && method !== "GET") {
                fetchOptions.body = body;
                if (!fetchHeaders["Content-Type"]) {
                    fetchHeaders["Content-Type"] = "application/json";
                }
            }

            const response = await fetch(url, fetchOptions);
            clearTimeout(timer);

            let responseBody: string;
            const contentType = response.headers.get("content-type") || "";
            const cl = response.headers.get("content-length");
            const size = cl ? parseInt(cl, 10) : 0;

            if (size > 1_048_576) {
                responseBody = `[Response too large: ${(size / 1024 / 1024).toFixed(1)} MB. Truncated.]`;
            } else if (contentType.includes("application/json") || contentType.includes("text") || contentType.includes("xml") || contentType.includes("html")) {
                responseBody = await response.text();
                if (responseBody.length > 100_000) {
                    responseBody = responseBody.slice(0, 100_000) + `\n\n... (${responseBody.length - 100_000} more chars omitted)`;
                }
            } else {
                responseBody = `[Binary content: ${contentType || "unknown"}]`;
            }

            const headers_out: Record<string, string> = {};
            response.headers.forEach((v, k) => { headers_out[k] = v; });

            return [
                `Status: ${response.status} ${response.statusText}`,
                `Content-Type: ${contentType}`,
                ...Object.entries(headers_out).slice(0, 15).map(([k, v]) => `${k}: ${v}`),
                "",
                responseBody
            ].join("\n");
        } catch (err: any) {
            if (err.name === "AbortError") {
                return "HTTP error: Request timed out";
            }
            return `HTTP error: ${err.message}`;
        }
    },
    {
        name: "http_request",
        description: "Make HTTP/HTTPS requests to external APIs and websites. Supports GET, POST, PUT, PATCH, DELETE. Custom headers and body are supported. Response is truncated at 100KB. Internal/private IPs are blocked for security.",
        schema: z.object({
            url: z.string().describe("Full URL to request (https:// or http:// only)"),
            method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional().describe("HTTP method (default: GET)"),
            headers: z.record(z.string()).optional().describe("Optional HTTP headers as key-value pairs"),
            body: z.string().optional().describe("Request body string (for POST/PUT/PATCH)"),
            timeout: z.number().optional().describe("Timeout in milliseconds (default: 30000, max: 60000)")
        })
    }
);
