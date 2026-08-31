"use client";

import { useCallback, useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useUser } from "@/lib/auth";
import { api } from "@convex/_generated/api";
import { getBookBySlug } from "@/lib/bible-data";

type Props = {
  bookSlug: string;
  chapter: number;
  totalChapters: number;
  /** Used to scale how long "read" should plausibly have taken. */
  verseCount: number;
  onComplete?: () => void;
};

export function ReadingProgress({
  bookSlug,
  chapter,
  totalChapters,
  verseCount,
  onComplete,
}: Props) {
  const { isSignedIn } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const progress = useQuery(
    api.readingProgress.getForBook,
    isAuthenticated ? { bookSlug } : "skip"
  );
  const markRead = useMutation(api.readingProgress.markRead);
  const markUnread = useMutation(api.readingProgress.markUnread);

  const isRead = progress?.[chapter] ?? false;
  const autoMarkedRef = useRef(false);
  const prevIsReadRef = useRef<boolean | null>(null);

  // Detect when chapter transitions to read — fire celebration
  useEffect(() => {
    if (progress === undefined) return; // Still loading
    if (isRead && prevIsReadRef.current === false) {
      onComplete?.();
    }
    prevIsReadRef.current = isRead;
  }, [isRead, progress, onComplete]);

  // Reset auto-mark flag when chapter changes
  useEffect(() => {
    autoMarkedRef.current = false;
  }, [bookSlug, chapter]);

  // Auto-mark as read once the reader reaches the end of the chapter.
  //
  // Reaching the bottom alone isn't evidence of reading — flicking to the end
  // of a chapter used to mark it read and fire the completion celebration. Two
  // extra conditions: the reader has to still be at the bottom a moment later
  // (a fast scroll that overshoots and bounces back doesn't count), and enough
  // time has to have passed for the chapter to plausibly have been read.
  useEffect(() => {
    if (!isAuthenticated || isRead) return;

    const openedAt = Date.now();
    const minimumDwellMs = Math.min(20_000, 4_000 + verseCount * 400);
    let settle: ReturnType<typeof setTimeout> | undefined;

    const atBottom = () =>
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 200;

    const handleScroll = () => {
      if (autoMarkedRef.current) return;

      if (!atBottom()) {
        clearTimeout(settle);
        settle = undefined;
        return;
      }
      if (settle) return;

      settle = setTimeout(() => {
        settle = undefined;
        if (autoMarkedRef.current || !atBottom()) return;
        if (Date.now() - openedAt < minimumDwellMs) return;

        autoMarkedRef.current = true;
        markRead({ bookSlug, chapter }).catch(() => {
          autoMarkedRef.current = false;
        });
      }, 1_500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(settle);
    };
  }, [isAuthenticated, isRead, markRead, bookSlug, chapter, verseCount]);

  const toggleRead = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      if (isRead) {
        await markUnread({ bookSlug, chapter });
      } else {
        await markRead({ bookSlug, chapter });
      }
    } catch {
      // Auth may not be ready; silently ignore
    }
  }, [isAuthenticated, isRead, markRead, markUnread, bookSlug, chapter]);

  const readCount = progress ? Object.keys(progress).length : 0;
  const pct =
    totalChapters > 0 ? Math.round((readCount / totalChapters) * 100) : 0;
  const bookName = getBookBySlug(bookSlug)?.name ?? bookSlug;

  if (!isSignedIn) return null;

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isRead ? "secondary" : "outline"}
        size="sm"
        className="gap-2 text-xs"
        onClick={toggleRead}
        aria-pressed={isRead}
      >
        <CheckCircle
          className={`h-3.5 w-3.5 ${isRead ? "text-green-600" : "text-muted-foreground"}`}
        />
        {isRead ? "Marked Read" : "Mark as Read"}
      </Button>

      <div
        className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground"
        title={`${bookName}: ${readCount} of ${totalChapters} chapters read`}
      >
        <span className="font-medium text-foreground/70">{bookName}</span>
        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary/60 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono tabular-nums">
          {readCount}/{totalChapters} read
        </span>
      </div>
    </div>
  );
}
