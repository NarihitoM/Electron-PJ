---
description: 'Use when adding or modifying a service integration feature (Slack, Telegram, Notion, Google, n8n, etc.). Covers the complete file structure, API pattern, chat UI, store, hooks, and routing setup.'
applyTo: "src/features/**"
---

# Service Integration Pattern

## File Structure

Every service feature under `src/features/<name>/` must have exactly these files:

```
features/<name>/
├── api/api.ts          # HTTP calls (Axios + fetch for streaming)
├── components/         # React components (Chat feature, header, etc.)
├── hooks/              # TanStack Query hooks (use<Name>Account, useDisconnect<Name>, etc.)
├── store/store.ts      # Zustand store (client/UI state only)
├── types/type.ts       # TypeScript interfaces
└── index.ts            # Barrel exports
```

## Step-by-Step Guide

### 1. Create the API layer (`api/api.ts`)

Use Axios with JWT interceptor (auto-attaches Bearer token). Use native `fetch` for streaming endpoints.

```typescript
// Standard REST calls — uses preconfigured axios instance
import { axiosInstance } from '@/shared/config/axioconfig'

export const myserviceauth = {
  connect: async (apiKey: string) => {
    const response = await axiosInstance.post('/api/myservice/connect', { apiKey })
    return response.data
  },
  fetchConfig: async () => {
    const response = await axiosInstance.get('/api/myservice/config')
    return response.data
  },
  disconnect: async () => {
    const response = await axiosInstance.delete('/api/myservice/disconnect')
    return response.data
  },
}
```

For **streaming chat**, use the `fetchconfig` from `@/shared/config/fetchconfig` — read NDJSON lines with typed events:

```typescript
import { fetchurl } from '@/shared/config/fetchconfig'

export const myserviceauth = {
  sendmessage: async (
    credentials: ...,
    onChunk: (chunk: string, title?: string) => void,
    onStatus?: (data: any) => void,
    onThinking?: (chunk: string) => void,
    onApproval?: (data: any) => void,
    onImage?: (url: string) => void,
  ) => {
    const response = await fetch(`${fetchurl}/api/myservice/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await window.api.getToken()}` },
      body: JSON.stringify({ ... }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const lines = decoder.decode(value).trim().split('\n')
      for (const line of lines) {
        const data = JSON.parse(line)
        if (data.type === 'text') onChunk(data.chunk, data.title)
        else if (data.type === 'thinking') onThinking(data.chunk)
        else if (data.type === 'status' || data.type === 'chain') onStatus(data)
        else if (data.type === 'tool_approval_request') onApproval(data)
        else if (data.type === 'image') onImage(data.url)
        else if (data.type === 'error') throw new Error(data.message)
      }
    }
  },
}
```

### 2. Create the Zustand store (`store/store.ts`)

```typescript
import { create } from 'zustand'

interface ServiceState {
  provider: string
  model: string
  input: string
  sending: boolean
  sessionmessage: any[]
  // ... other state
  setProvider: (provider: string) => void
  setModel: (model: string) => void
  setInput: (input: string) => void
  setSending: (sending: boolean) => void
  updateSessionMessages: (updater: (prev: any[]) => any[]) => void
  // ... other setters
}

export const servicestore = create<ServiceState>((set) => ({
  provider: '',
  model: '',
  input: '',
  sending: false,
  sessionmessage: [],
  setProvider: (provider) => set({ provider, model: '' }),
  setModel: (model) => set({ model }),
  setInput: (input) => set({ input }),
  setSending: (sending) => set({ sending }),
  updateSessionMessages: (updater) =>
    set((state) => ({ sessionmessage: updater(state.sessionmessage) })),
}))
```

### 3. Create TanStack Query hooks (`hooks/`)

Two hooks minimum — one for fetching connection status, one for disconnect mutation:

```typescript
// useMyServiceAccount.ts — connection status
import { useQuery } from '@tanstack/react-query'
import { myserviceauth } from '../api/api'

export const useMyServiceAccount = () => {
  return useQuery({
    queryKey: ['myserviceconfig'],
    queryFn: async () => {
      const response = await myserviceauth.fetchConfig()
      return response.success ? response.data : null
    },
    staleTime: 1000 * 60 * 10, // 10 min
    gcTime: 1000 * 60 * 10,
    retry: false,
  })
}

// useDisconnectMyService.ts — disconnect mutation
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { myserviceauth } from '../api/api'

export const useDisconnectMyService = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => myserviceauth.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myserviceconfig'] })
    },
  })
}
```

### 4. Create the Chat component (`components/`)

Every service chat UI follows the same structure — reference `src/features/n8n/components/N8nChat.tsx`:

```
<Toaster />
<ToolApprovalDialog />     ← from src/shared/components/layout/
<ConnectionPanel />         ← shows connection status (connected/disconnected)
<Header />                  ← provider/model selector
<MessageList />             ← renders sessionmessage array
<Input />                   ← text input + send button
<ImageLightbox />           ← from src/shared/components/layout/
```

### 5. Create barrel exports (`index.ts`)

```typescript
export { MyServiceChat } from './components/MyServiceChat'
export * from './api/api'
export * from './store/store'
export * from './types/type'
```

### 6. Page + Route wiring

Create a thin page wrapper in `src/pages/`:

```typescript
// src/pages/Myservice.tsx
export const Myservice = () => <MyServiceChat />
```

Add route in `src/App.tsx` under the protected `/app` layout, and add sidebar navigation entry in `src/shared/routes/Navigationroute.ts`.

## Key Rules

- **Never** import feature stores/components across feature boundaries. If shared, put it in `src/shared/`.
- **Query key** naming: lowercase kebab-case, e.g., `['n8nconfig']`, `['slack-messages']`.
- **Store field naming**: match existing stores (`provider`, `model`, `input`, `sending`, `sessionmessage`, `pendingImages`, `loadingfetch`, `loadingerror`, `nextCursor`, `hasMore`).
- **Connection status**: Use a TanStack Query hook, not Zustand — connections are server state.
- **No direct state mutation**: Use `updateSessionMessages(prev => [...])` pattern, never `state.sessionmessage.push()`.
- **Streaming**: Always use native `fetch` (not Axios) for streaming endpoints — Axios doesn't support ReadableStream well.
