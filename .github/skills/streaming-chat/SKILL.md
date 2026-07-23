---
name: streaming-chat
description: "Implement or debug NDJSON streaming chat for service integrations in MultimateAi. Use when: wiring up chat endpoints, handling SSE/NDJSON event types, fixing streaming bugs, adding a new chat feature that sends messages and receives typed events."
user-invocable: true
---

# Streaming Chat — NDJSON Pattern

## When to Use

- Adding a new service with a chat interface (messages in, typed events out)
- Debugging a streaming endpoint that hangs or drops events
- Understanding the `type: "text" | "thinking" | "status" | "tool_approval_request" | "image" | "error"` event model

## Architecture

All chat features (Chat, Telegram, Slack, Notion, Google Sheets, Google Docs, n8n) use an identical streaming pattern:

```
React Component
  → Zustand store (sending, sessionmessage, provider, model)
    → API function (native fetch + ReadableStream)
      → Backend SSE endpoint (NDJSON over HTTP)
        → callbacks: onChunk, onThinking, onStatus, onApproval, onImage
```

## Streaming API Pattern

Every chat feature's `api/api.ts` must define a `sendmessage` function with these callbacks:

```typescript
sendmessage: async (
  params: SendMessageParams,
  onChunk: (chunk: string, title?: string) => void,
  onThinking?: (chunk: string) => void,
  onStatus?: (data: StatusData) => void,
  onApproval?: (data: ApprovalData) => void,
  onImage?: (url: string) => void,
) => { ... }
```

### NDJSON Event Types

| `type`                  | Callback                 | Payload              | Description                                                |
| ----------------------- | ------------------------ | -------------------- | ---------------------------------------------------------- |
| `text`                  | `onChunk(chunk, title?)` | `{ chunk, title? }`  | Streamed response text. `title` appears on the first chunk |
| `thinking`              | `onThinking(chunk)`      | `{ chunk }`          | Model thinking/reasoning tokens                            |
| `status`                | `onStatus(data)`         | `{ type, data }`     | Status updates (e.g., "searching...", "processing...")     |
| `chain`                 | `onStatus(data)`         | `{ type, data }`     | Agent chain step events (same handler as status)           |
| `tool_approval_request` | `onApproval(data)`       | `{ tool, args, id }` | Human-in-the-loop tool approval request                    |
| `image`                 | `onImage(url)`           | `{ url }`            | Generated image URL                                        |
| `error`                 | throws Error             | `{ message }`        | Fatal error — stop streaming                               |

### Complete Implementation

```typescript
import { fetchurl } from "@/shared/config/fetchconfig";

export const myserviceauth = {
  sendmessage: async (
    credentials: Record<string, any>,
    onChunk: (chunk: string, title?: string) => void,
    onThinking?: (chunk: string) => void,
    onStatus?: (data: any) => void,
    onApproval?: (data: any) => void,
    onImage?: (url: string) => void,
  ) => {
    const response = await fetch(`${fetchurl}/api/myservice/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await window.api.getToken()}`,
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.trim().split("\n");

      for (const line of lines) {
        if (!line) continue;
        const data = JSON.parse(line);

        switch (data.type) {
          case "text":
            onChunk(data.chunk, data.title);
            break;
          case "thinking":
            onThinking?.(data.chunk);
            break;
          case "status":
          case "chain":
            onStatus?.(data);
            break;
          case "tool_approval_request":
            onApproval?.(data);
            break;
          case "image":
            onImage?.(data.url);
            break;
          case "error":
            throw new Error(data.message);
        }
      }
    }
  },
};
```

## Hook Integration Pattern

The streaming function is called from a component, usually via a custom hook or inline. The pattern is:

```typescript
const sendMessage = async () => {
  store.setSending(true)
  try {
    await myserviceauth.sendmessage(
      { provider, model, message: input, ... },
      (chunk, title) => {
        store.updateSessionMessages(prev => {
          // Append chunk to last message or create new message
        })
      },
      (chunk) => store.setThinking(prev => prev + chunk),
      (data) => console.log('status:', data),
      (data) => store.setPendingApproval(data),
      (url) => store.addImage(url),
    )
  } catch (err) {
    toast.error(err.message)
  } finally {
    store.setSending(false)
  }
}
```

## Common Streaming Bugs

| Symptom                  | Cause                                              | Fix                                            |
| ------------------------ | -------------------------------------------------- | ---------------------------------------------- |
| Empty chunks             | `decoder.decode(value)` without `{ stream: true }` | Add `{ stream: true }` to handle partial UTF-8 |
| Lines merged             | Not splitting by `\n`                              | Always `text.split('\n')` after decoding       |
| Missing last chunk       | `break` on `done` before processing buffer         | Process remaining buffer after loop            |
| TypeErrors on JSON.parse | Empty line in stream                               | Add `if (!line) continue` before parsing       |
| Stream never ends        | Backend not closing response                       | Check backend for missing `res.end()`          |

## Key Files to Reference

- `src/features/chat/api/api.ts` — reference implementation
- `src/features/n8n/api/api.ts` — service chat example
- `src/shared/config/fetchconfig.ts` — fetch URL config
