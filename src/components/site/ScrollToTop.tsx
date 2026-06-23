import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Scrolls the window to top on every pathname change.
 * Mounted once near the router outlet.
 */
export function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}
