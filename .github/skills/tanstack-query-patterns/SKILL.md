---
name: tanstack-query-patterns
description: "Use TanStack Query v5 patterns in the MultimateAi codebase. Use when: creating queries or mutations, invalidating cache, handling loading/error states, setting up query keys, or configuring staleTime/gcTime."
user-invocable: true
---

# TanStack Query Patterns

## When to Use

- Creating a new `useQuery` or `useMutation` hook
- Debugging stale data or unwanted refetches
- Setting up query key naming conventions
- Handling optimistic updates or cache invalidation

## Global Config

Defined in `src/shared/config/tanstackqueryconfig.ts`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (v5 rename of cacheTime)
    },
  },
});
```

## Query Hook Pattern

Every feature follows this exact shape for data-fetching hooks:

```typescript
import { useQuery } from "@tanstack/react-query";
import { myserviceauth } from "../api/api";

export const useMyServiceAccount = () => {
  return useQuery({
    queryKey: ["myserviceconfig"],
    queryFn: async () => {
      const response = await myserviceauth.fetchConfig();
      return response.success ? response.data : null;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
};
```

### Key Rules

- **Query keys**: lowercase hyphenated string, e.g., `['n8nconfig']`, `['user']`, `['chat']`, `['telegramaccount']`, `['slack-messages']`
- **staleTime**: Always 10 minutes (`1000 * 60 * 10`) unless the data must be fresh
- **gcTime**: Match staleTime
- **retry**: Usually `false` — let the UI handle errors via toast
- **queryFn**: Always parse the API response and return the data payload or `null`

## Mutation Hook Pattern

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { myserviceauth } from "../api/api";

export const useDisconnectMyService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => myserviceauth.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myserviceconfig"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Failed to disconnect");
    },
  });
};
```

### Mutation Patterns by Type

| Action                      | Cache Strategy                                      |
| --------------------------- | --------------------------------------------------- |
| Disconnect / Delete         | `invalidateQueries` — refetch to show updated state |
| Create / Connect            | `invalidateQueries` — refetch list                  |
| Update / Rename             | `setQueryData` — optimistic update preferred        |
| Toggle (e.g., pin, archive) | `setQueryData` for instant UI feedback              |

## Using Hooks in Components

The standard usage pattern in service components:

```typescript
const MyServicePage = () => {
  const { data: config, isLoading, error } = useMyServiceAccount()
  const disconnect = useDisconnectMyService()

  if (isLoading) return <Spinner />
  if (error || !config) return <ConnectForm />

  return (
    <div>
      <ConnectionStatus config={config} />
      <Button onClick={() => disconnect.mutate()}>Disconnect</Button>
    </div>
  )
}
```

## Query Invalidation Map

| Query Key             | Invalidated By                | Effect                    |
| --------------------- | ----------------------------- | ------------------------- |
| `['user']`            | Login, logout, profile update | Refetch current user      |
| `['n8nconfig']`       | Connect, disconnect           | Refetch connection status |
| `['telegramaccount']` | Connect, disconnect           | Refetch connection status |
| `['slackaccount']`    | Connect, disconnect           | Refetch connection status |
| `['notionaccount']`   | Connect, disconnect           | Refetch connection status |
| `['chat']`            | Create, delete chat           | Refetch chat list         |
| `['key']`             | Add, delete service key       | Refetch API keys          |

## Best Practices

- **Don't put connection status in Zustand** — server state belongs in React Query
- **Use `enabled` option** — for queries that depend on auth: `enabled: !!token`
- **Avoid `refetchOnWindowFocus`** — global config already handles this (default: true, but long staleTime mitigates it)
- **Type your query responses** — prefer `useQuery<T>` for type safety
- **GC time matters** — with heavy chat data, adjust `gcTime` down if memory is a concern
