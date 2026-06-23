import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 60s — prevents duplicate fetches when navigating
        // between admin pages or back-and-forth between list and detail.
        staleTime: 60 * 1000,
        // Avoid extra refetches on window focus during editing sessions.
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Keep loader data fresh for 30s; was 0 (every nav re-fetched everything).
    defaultPreloadStaleTime: 30 * 1000,
  });

  return router;
};
