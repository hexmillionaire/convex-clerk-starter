"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production only. In development a cached
 * app shell hides your edits and is the single most confusing thing a PWA
 * can do to you, so it never runs there.
 *
 * To drop PWA support entirely: delete this file, `public/sw.js`,
 * `public/manifest.json`, and the two references in `src/app/layout.tsx`.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-critical: the app works without offline support.
    });
  }, []);

  return null;
}
