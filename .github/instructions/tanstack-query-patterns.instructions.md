---
description: "Must-follow rules for TanStack Query v5 in the MultimateAi codebase. Covers global config, query/mutation hook patterns, query key conventions, and cache invalidation."
applyTo: "src/**"
---

# TanStack Query Patterns — Rules

## Global Config (src/shared/config/tanstackqueryconfig.ts)

```typescript
staleTime: 1000 * 60 * 10, // 10 minutes
gcTime: 1000 * 60 * 10,     // 10 minutes (v5 rename of cacheTime)
```

## Query Hook Rules

### Query Keys

Must be **lowercase hyphenated strings**:

```typescript
[
  "n8nconfig",
] // ✅
[
  "telegramaccount"
] // ✅
[
  "slack-messages"
] // ✅
[
  "user"
] // ✅
[
  "chat"
] // ✅
[
  "myserviceconfig"
] // ✅
[
  "n8nConfig"
] // ❌ no camelCase
["telegram_account"]; // ❌ no underscores
```

### Standard Query Template

```typescript
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

### Mutation + Cache Invalidation Template

```typescript
export const useDisconnectMyService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => myserviceauth.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myserviceconfig"] });
      toast.success("Disconnected successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Operation failed");
    },
  });
};
```

## Cache Strategy by Mutation Type

| Action                | Strategy                    |
| --------------------- | --------------------------- |
| Disconnect / Delete   | `invalidateQueries`         |
| Create / Connect      | `invalidateQueries`         |
| Update / Rename       | `setQueryData` (optimistic) |
| Toggle (pin, archive) | `setQueryData` (optimistic) |

## Rules

- **Don't put connection status in Zustand** — it's server state, use React Query
- **Use `enabled` option** for auth-dependent queries: `enabled: !!token`
- **`retry: false`** for user-facing queries — handle errors via toast
- **Type query responses**: `useQuery<T>` for type safety
