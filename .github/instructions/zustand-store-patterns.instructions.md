---
description: "Must-follow rules for creating or modifying Zustand v5 stores in the MultimateAi codebase. Covers the common store shape, setter patterns, and store vs React Query boundary."
applyTo: "src/**"
---

# Zustand Store Patterns — Rules

## Common Store Fields

Every feature store **must** use these exact field names:

```typescript
interface FeatureStore {
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

  // Setters
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setInput: (input: string) => void;
  setSending: (sending: boolean) => void;
  updateSessionMessages: (updater: (prev: any[]) => any[]) => void;
}
```

## Critical Rules

### 1. `setProvider` MUST Reset Model

```typescript
setProvider: (provider) => set({ provider, model: "" });
// Always — prevents sending with a model that doesn't exist on the new provider
```

### 2. NEVER Mutate `sessionmessage` Directly

```typescript
// ✅ CORRECT
store.updateSessionMessages((prev) => [...prev, newMessage]);

// ❌ WRONG — won't trigger re-render
store.sessionmessage.push(newMessage);
```

### 3. Refs Stored as Objects

```typescript
abortControllerRef: { current: null } as React.MutableRefObject<AbortController | null>,
```

### 4. Subscribe to Individual Fields

```typescript
// ✅ CORRECT — avoids unnecessary re-renders
const provider = featurestore((s) => s.provider);

// ❌ WRONG — re-renders on ANY state change
const { provider, model } = featurestore();
```

## Store vs React Query Boundary

| State Type                          | Tool                                      |
| ----------------------------------- | ----------------------------------------- |
| UI state (inputs, toggles, modals)  | **Zustand**                               |
| Server state (data from API)        | **TanStack Query**                        |
| Session messages, pending approvals | **Zustand**                               |
| Connection status, config           | **TanStack Query** — never put in Zustand |
