import http from "node:http";
import net from "node:net";
import { createModel } from "../Agent/provider";
import { type Servicefetch } from "../../src/features/services/types/type";

const DEFAULT_PORT = 8787;

let server: http.Server | null = null;
let currentPort = DEFAULT_PORT;
let localApiKey = "";
let authToken = "";
let providerConfigs: {
  encryptkey: Servicefetch[];
  useremail: string;
  hostmap: Record<string, string>;
  models: Record<string, { model: string }[]>;
  aliases: { alias: string; provider: string; model: string }[];
} | null = null;

const splitModel = (model: string): { provider: string; model: string } => {
  const idx = model.indexOf("/");
  if (idx === -1) return { provider: "", model };
  const provider = model.slice(0, idx).toLowerCase();
  const rest = model.slice(idx + 1);
  return { provider, model: rest };
};

const matchProviderForModel = (model: string): { provider: string; model: string } | null => {
  if (!providerConfigs) return null;

  const aliasHit = providerConfigs.aliases.find((a) => a.alias === model);
  if (aliasHit) return { provider: aliasHit.provider, model: aliasHit.model };

  const explicit = splitModel(model);
  if (explicit.provider) return explicit;

  for (const [provider, models] of Object.entries(providerConfigs.models)) {
    const hit = models.find((m) => m.model === model);
    if (hit) return { provider, model };
  }

  for (const [provider, models] of Object.entries(providerConfigs.models)) {
    const hit = models.find((m) => model.startsWith(m.model.split(":")[0]));
    if (hit) return { provider, model };
  }

  const firstProvider = Object.keys(providerConfigs.models)[0];
  if (firstProvider) return { provider: firstProvider, model };
  return null;
};

const extractTokenUsage = (response: any): { inputTokens: number; outputTokens: number } => {
  const usage = response?.usage_metadata;
  if (usage) {
    return {
      inputTokens: usage.input_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0,
    };
  }
  const lc = response?.response_metadata?.tokenUsage;
  if (lc) {
    return {
      inputTokens: lc.promptTokens ?? 0,
      outputTokens: lc.completionTokens ?? 0,
    };
  }
  const raw = response?.response_metadata?.usage;
  if (raw) {
    return {
      inputTokens: raw.input_tokens ?? raw.prompt_tokens ?? 0,
      outputTokens: raw.output_tokens ?? raw.completion_tokens ?? 0,
    };
  }
  return { inputTokens: 0, outputTokens: 0 };
};

const logUsage = async (
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  latencyMs: number,
  success: boolean,
) => {
  try {
    if (!authToken) return;
    const { Server } = await import("../../src/shared/config/axioconfig");
    await Server.post(
      "/dashboard/api/usage/log",
      {
        provider,
        model,
        agent: "local-api",
        inputTokens,
        outputTokens,
        latencyMs,
        success,
      },
      { headers: { Authorization: `Bearer ${authToken}` } },
    );
  } catch (err) {
    console.error("Failed to log local API usage:", err);
  }
};

const sendJson = (res: http.ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

const readBody = (req: http.IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
};

const handleModels = (_req: http.IncomingMessage, res: http.ServerResponse) => {
  if (!providerConfigs) {
    return sendJson(res, 400, {
      error: {
        message: "Provider configuration not loaded. Start the local API from Settings.",
        type: "invalid_request_error",
      },
    });
  }

  const data: { id: string; object: string; created: number; owned_by: string }[] = [];
  for (const [provider, models] of Object.entries(providerConfigs.models)) {
    for (const m of models) {
      data.push({ id: m.model, object: "model", created: Date.now() / 1000, owned_by: provider });
    }
  }

  return sendJson(res, 200, { object: "list", data });
};

const handleChatCompletions = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  let body: any;
  try {
    body = await readBody(req);
  } catch (err: any) {
    return sendJson(res, 400, {
      error: { message: err?.message || "Invalid JSON body", type: "invalid_request_error" },
    });
  }

  const { model, messages, stream = false, temperature, max_tokens } = body;
  if (!model || typeof model !== "string") {
    return sendJson(res, 400, {
      error: { message: "model is required", type: "invalid_request_error" },
    });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return sendJson(res, 400, {
      error: {
        message: "messages is required and must be a non-empty array",
        type: "invalid_request_error",
      },
    });
  }
  if (!providerConfigs) {
    return sendJson(res, 400, {
      error: {
        message: "Provider configuration not loaded. Start the local API from Settings.",
        type: "invalid_request_error",
      },
    });
  }

  const matched = matchProviderForModel(model);
  if (!matched) {
    return sendJson(res, 404, {
      error: {
        message: `Model '${model}' not found. Available models: ${Object.values(
          providerConfigs.models,
        )
          .flat()
          .map((m) => m.model)
          .join(", ")}`,
        type: "invalid_request_error",
      },
    });
  }

  const { provider, model: resolvedModel } = matched;

  let llm;
  try {
    ensureAuthToken();
    const keyMap: Record<string, string> = {};
    providerConfigs.encryptkey.forEach((item) => {
      keyMap[item.provider.toLowerCase()] = item.apiKey;
    });
    llm = await createModel(
      { provider, model: resolvedModel },
      keyMap,
      providerConfigs.useremail,
      providerConfigs.hostmap,
    );
  } catch (err: any) {
    return sendJson(res, 500, {
      error: {
        message: `Failed to initialize provider '${provider}': ${err?.message || String(err)}`,
        type: "server_error",
      },
    });
  }

  const startTime = Date.now();

  const extractText = (content: any): string => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .filter((p: any) => p.type === "text" && p.text)
        .map((p: any) => p.text)
        .join("");
    }
    return "";
  };

  const promptMessages = messages.map((m: any) => {
    const text = extractText(m.content);
    if (m.role === "system") return { type: "system", content: text };
    if (m.role === "assistant") return { type: "ai", content: text };
    return { type: "human", content: text };
  });

  const callOptions: any = {
    ...(typeof temperature === "number" ? { temperature } : {}),
    ...(typeof max_tokens === "number" ? { maxTokens: max_tokens } : {}),
  };

  if (stream) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    try {
      const streamResponse: any = await llm.stream(promptMessages, callOptions);
      let fullText = "";
      let usage: any = null;

      for await (const chunk of streamResponse) {
        const text = typeof chunk?.content === "string" ? chunk.content : "";
        if (text) {
          fullText += text;
          const payload = {
            id: `chatcmpl-local-${Date.now()}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
          };
          res.write(`data: ${JSON.stringify(payload)}\n\n`);
        }
        if (chunk?.usage_metadata) usage = chunk.usage_metadata;
      }

      const donePayload = {
        id: `chatcmpl-local-${Date.now()}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      };
      res.write(`data: ${JSON.stringify(donePayload)}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();

      const { inputTokens, outputTokens } = extractTokenUsage(usage || {});
      logUsage(
        provider,
        resolvedModel,
        inputTokens || 0,
        outputTokens || fullText.length,
        Date.now() - startTime,
        true,
      );
    } catch (err: any) {
      const errorPayload = {
        error: { message: err?.message || String(err), type: "server_error" },
      };
      res.write(`data: ${JSON.stringify(errorPayload)}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      logUsage(provider, resolvedModel, 0, 0, Date.now() - startTime, false);
    }
    return;
  }

  try {
    const response = await llm.invoke(promptMessages, callOptions);

    const content = Array.isArray(response?.content)
      ? response.content
          .filter((c: any) => c?.type === "text" && c.text)
          .map((c: any) => c.text)
          .join("")
      : typeof response?.content === "string"
        ? response.content
        : "";

    const { inputTokens, outputTokens } = extractTokenUsage(response || {});

    const payload = {
      id: `chatcmpl-local-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens || content.length,
        total_tokens: inputTokens + (outputTokens || content.length),
      },
    };

    logUsage(
      provider,
      resolvedModel,
      inputTokens,
      outputTokens || content.length,
      Date.now() - startTime,
      true,
    );
    return sendJson(res, 200, payload);
  } catch (err: any) {
    logUsage(provider, resolvedModel, 0, 0, Date.now() - startTime, false);
    return sendJson(res, 500, {
      error: { message: err?.message || String(err), type: "server_error" },
    });
  }
};

const ensureAuthToken = () => {
  if (!process.env.CURRENT_AUTH_TOKEN && authToken) {
    process.env.CURRENT_AUTH_TOKEN = authToken;
  }
};

const isAuthorized = (req: http.IncomingMessage): boolean => {
  if (!localApiKey) return false;
  const auth = req.headers.authorization || "";
  return auth === `Bearer ${localApiKey}`;
};

export const startLocalApiServer = async (config: {
  encryptkey: Servicefetch[];
  useremail: string;
  hostmap: Record<string, string>;
  models: Record<string, { model: string }[]>;
  aliases?: { alias: string; provider: string; model: string }[];
  port?: number;
  apiKey?: string;
  token?: string;
}): Promise<{ port: number; url: string }> => {
  if (server) {
    providerConfigs = { ...config, aliases: config.aliases || [] };
    if (config.apiKey) localApiKey = config.apiKey;
    if (config.token) authToken = config.token;
    return { port: currentPort, url: `http://127.0.0.1:${currentPort}/v1` };
  }

  const port = config.port || DEFAULT_PORT;
  const portAvailable = await checkPortAvailable(port);
  if (!portAvailable) {
    throw new Error(
      `Port ${port} is already in use. Stop the other process or use a different port.`,
    );
  }

  providerConfigs = config;
  localApiKey = config.apiKey || "";
  authToken = config.token || "";
  currentPort = port;

  await new Promise<void>((resolve) => {
    server = http.createServer((req, res) => {
      if (req.url?.startsWith("/v1/")) {
        if (!isAuthorized(req)) {
          return sendJson(res, 401, {
            error: { message: "Invalid or missing API key.", type: "invalid_request_error" },
          });
        }
      }
      if (req.method === "GET" && req.url === "/v1/models") {
        return handleModels(req, res);
      }
      if (req.method === "POST" && req.url === "/v1/chat/completions") {
        handleChatCompletions(req, res).catch((err) => {
          console.error("Local API chat completion error:", err);
          if (!res.headersSent) {
            sendJson(res, 500, {
              error: { message: String(err?.message || err), type: "server_error" },
            });
          } else {
            res.end();
          }
        });
        return;
      }
      if (req.method === "GET" && req.url === "/health") {
        return sendJson(res, 200, { status: "ok" });
      }
      sendJson(res, 404, { error: { message: "Not found", type: "invalid_request_error" } });
    });

    server.on("error", (err) => {
      console.error("Local API server error:", err);
    });

    server.listen(currentPort, "127.0.0.1", () => resolve());
  });

  return { port: currentPort, url: `http://127.0.0.1:${currentPort}/v1` };
};

export const stopLocalApiServer = async (): Promise<void> => {
  if (!server) return;
  const s = server;
  server = null;
  providerConfigs = null;
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      try {
        (s as any).closeAllConnections?.();
      } catch {
        // ignore - connection cleanup is best effort
      }
      resolve();
    }, 2000);
    s.close(() => {
      clearTimeout(timeout);
      resolve();
    });
  });
};

export const getLocalApiStatus = (): { running: boolean; port: number; url: string | null } => {
  if (!server) return { running: false, port: currentPort, url: null };
  return { running: true, port: currentPort, url: `http://127.0.0.1:${currentPort}/v1` };
};

export const checkPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(false))
      .once("listening", () => {
        tester.close(() => resolve(true));
      })
      .listen(port, "127.0.0.1");
  });
};
