"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Check, Loader2, WifiOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BIBLE_BOOKS } from "@/lib/bible-data";

const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0);

type State =
  | { status: "idle" }
  | { status: "downloading"; done: number }
  | { status: "ready" }
  | { status: "error"; message: string };

/**
 * Downloads the whole KJV for offline reading.
 *
 * The service worker already kept chapters a reader had visited, but there was
 * no way to fetch ahead — so "offline" meant a working shell with no scripture
 * in it. The KJV is about 4MB of text, well within what a phone will hold.
 */
export function OfflineDownload() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) {
      setSupported(false);
      return;
    }
    // Report already-downloaded without blocking paint.
    let cancelled = false;
    caches
      .open("divine-word-bible-v1")
      .then((cache) => cache.keys())
      .then((keys) => {
        if (!cancelled && keys.length >= TOTAL_CHAPTERS) setState({ status: "ready" });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const download = useCallback(async () => {
    setState({ status: "downloading", done: 0 });
    try {
      const cache = await caches.open("divine-word-bible-v1");
      let done = 0;

      // Six at a time: enough to saturate a phone connection without
      // flooding the cache API or the server.
      const queue = BIBLE_BOOKS.flatMap((book) =>
        Array.from({ length: book.chapters }, (_, i) => `/api/bible/${book.slug}/${i + 1}`)
      );

      let cursor = 0;
      await Promise.all(
        Array.from({ length: 6 }, async () => {
          while (cursor < queue.length) {
            const url = queue[cursor++];
            try {
              const res = await fetch(url);
              if (res.ok) await cache.put(url, res.clone());
            } catch {
              // A single chapter failing shouldn't abandon the whole download;
              // it will be fetched normally next time it's opened.
            }
            done++;
            if (done % 10 === 0) setState({ status: "downloading", done });
          }
        })
      );

      setState({ status: "ready" });
    } catch {
      setState({
        status: "error",
        message: "The download didn't finish. Check your connection and try again.",
      });
    }
  }, []);

  const remove = useCallback(async () => {
    await caches.delete("divine-word-bible-v1");
    setState({ status: "idle" });
  }, []);

  if (!supported) return null;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <WifiOff className="h-4 w-4 text-primary" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-sm font-semibold">Read offline</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep the whole King James Version on this device — about 4MB. Useful
            on a plane, in a basement, or anywhere the signal goes.
          </p>

          <div className="mt-4">
            {state.status === "idle" && (
              <Button className="h-11 gap-2" onClick={download}>
                <Download className="h-4 w-4" />
                Download the Bible
              </Button>
            )}

            {state.status === "downloading" && (
              <div className="flex flex-col gap-2">
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={TOTAL_CHAPTERS}
                  aria-valuenow={state.done}
                  aria-label="Downloading the Bible"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${(state.done / TOTAL_CHAPTERS) * 100}%` }}
                  />
                </div>
                <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground tabular-nums">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {state.done.toLocaleString()} of {TOTAL_CHAPTERS.toLocaleString()} chapters
                </p>
              </div>
            )}

            {state.status === "ready" && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="flex items-center gap-2 text-sm text-primary">
                  <Check className="h-4 w-4" />
                  Saved to this device
                </p>
                <Button variant="ghost" className="h-11 gap-2 text-xs" onClick={remove}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            )}

            {state.status === "error" && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-destructive">{state.message}</p>
                <Button variant="outline" className="h-11 gap-2" onClick={download}>
                  <Download className="h-4 w-4" />
                  Try again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
