"use client";

import { useSyncExternalStore } from "react";

/**
 * Matches a CSS media query, without a mount effect.
 *
 * The server snapshot is always `false`, so anything gated on this must be
 * additive to the server-rendered output rather than a different layout — the
 * reader's touch actions open on tap, which can only happen after hydration.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Tailwind's `md` breakpoint — below it the reader uses touch affordances. */
export const useIsCompact = () => useMediaQuery("(max-width: 767px)");
