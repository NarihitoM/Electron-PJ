---
name: zustand-store-patterns
description: "Create or modify Zustand v5 stores in the MultimateAi codebase. Use when: building a new feature store, adding state to an existing store, understanding the common store shape, or fixing store-related bugs."
user-invocable: true
---

# Zustand Store Patterns

## When to Use

- Adding a new feature that needs client state
- Understanding the standard store fields
- Debugging store updates that don't trigger re-renders
- Adding provider/model selector state

## Common Store Shape

Every feature store follows this interface pattern:

```typescript
interface FeatureState {
  // Chat state
  provider: string;
  model: string;
  input: string;
  sending: boolean;
  sessionmessage: any[];
  pendingImages: any[];

  // Loading & pagination
  loadingfetch: boolean;
  loadingerror: boolean;
  nextCursor: string | null;
  hasMore: boolean;

  // Image lightbox
  lightboxOpen: boolean;
  lightboxImage: string | null;

  // UI state
  copiedIndex: number | null;
  pendingApproval: ToolApproval | null;

  // Refs (stored in state for React compat)
  pendingApprovalRef: React.MutableRefObject<any>;
  threadIdRef: React.MutableRefObject<string>;
  topSentinelRef: React.MutableRefObject<HTMLDivElement | null>;
  scrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;

  // Setters
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setInput: (input: string) => void;
  setSending: (sending: boolean) => void;
  updateSessionMessages: (updater: (prev: any[]) => any[]) => void;
  resetSending: () => void;
  scrollToBottom: () => void;
}
```

## Store Template

```typescript
import { create } from "zustand";

interface FeatureStore {
  // === State ===
  provider: string;
  model: string;
  input: string;
  sending: boolean;
  sessionmessage: any[];
  loadingfetch: boolean;
  loadingerror: boolean;

  // === Setters ===
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setInput: (input: string) => void;
  setSending: (sending: boolean) => void;
  updateSessionMessages: (updater: (prev: any[]) => any[]) => void;
}

export const featurestore = create<FeatureStore>((set) => ({
  // Initial state
  provider: "",
  model: "",
  input: "",
  sending: false,
  sessionmessage: [],
  loadingfetch: false,
  loadingerror: false,

  // Setters
  setProvider: (provider) => set({ provider, model: "" }), // Reset model on provider change
  setModel: (model) => set({ model }),
  setInput: (input) => set({ input }),
  setSending: (sending) => set({ sending }),
  updateSessionMessages: (updater) =>
    set((state) => ({ sessionmessage: updater(state.sessionmessage) })),
}));
```

## Critical Patterns

### 1. `setProvider` Resets the Model

```typescript
setProvider: (provider) => set({ provider, model: "" });
```

When the user switches providers, the selected model **must** reset to empty. This prevents sending a request with a model that doesn't exist on the new provider.

### 2. `updateSessionMessages` Pattern

Never mutate `sessionmessage` directly:

```typescript
// ✅ Correct
store.updateSessionMessages((prev) => [...prev, newMessage]);

// ❌ Wrong — won't trigger re-render
store.sessionmessage.push(newMessage);
```

### 3. Ref Objects in Zustand

React refs stored in Zustand need special handling:

```typescript
abortControllerRef: { current: null } as React.MutableRefObject<AbortController | null>,
```

### 4. Reset Form Helper

Agent feature has a `resetForm` pattern to clear dialog state:

```typescript
resetForm: () =>
  set({
    provider: "",
    model: "",
    input: "",
    sending: false,
  });
```

## Store Usage in Components

```typescript
import { featurestore } from '../store/store'

const MyComponent = () => {
  const provider = featurestore((s) => s.provider)
  const setProvider = featurestore((s) => s.setProvider)
  const sessionmessage = featurestore((s) => s.sessionmessage)

  return (
    <select value={provider} onChange={(e) => setProvider(e.target.value)}>
      {providers.map((p) => <option key={p}>{p}</option>)}
    </select>
  )
}
```

**Performance tip**: Subscribe to individual fields (`featurestore((s) => s.provider)`) rather than the whole store to avoid unnecessary re-renders.

## Store vs React Query Boundary

| State Type                         | Tool                        | Example                                                 |
| ---------------------------------- | --------------------------- | ------------------------------------------------------- |
| UI state (inputs, toggles, modals) | Zustand                     | `provider`, `model`, `input`, `sending`, `lightboxOpen` |
| Server state (data from API)       | TanStack Query              | `useN8nConfig()`, `useUser()`                           |
| Derived/intermediate state         | Zustand                     | `sessionmessage`, `pendingApproval`                     |
| Refs                               | Zustand (stored as objects) | `scrollContainerRef`, `abortControllerRef`              |

## Key Files to Reference

- `src/features/chat/store/store.ts` — canonical store example
- `src/features/n8n/store/store.ts` — service feature store
- `src/features/agent/store/store.ts` — agent workflow store (has additional complexity)
