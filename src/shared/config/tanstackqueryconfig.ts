import { QueryClient } from "@tanstack/react-query";

export const datafetch = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 10,
    },
  },
});
