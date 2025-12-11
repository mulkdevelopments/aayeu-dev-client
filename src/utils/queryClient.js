// utils/queryClient.js
"use client";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // retry once on failure
      refetchOnWindowFocus: false, // disable auto refetch when tab focuses
      staleTime: 1000 * 60, // cache valid for 1 min
    },
  },
});
