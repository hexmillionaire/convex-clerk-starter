"use client";

import { useCallback, useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";

type Props = {
  bookSlug: string;
  chapter: number;
  totalChapters: number;
};

export function ReadingProgress({ bookSlug, chapter, totalChapters }: Props) {
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

  // Reset auto-mark flag when chapter changes
  useEffect(() => {
    autoMarkedRef.current = false;
  }, [bookSlug, chapter]);

  // Auto-mark as read when user scrolls to bottom
  useEffect(() => {
    if (!isAuthenticated || isRead) return;

    const handleScroll = () => {
      if (autoMarkedRef.current) return;
      const scrolled = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 200;
      if (scrolled >= threshold) {
        autoMarkedRef.current = true;
        markRead({ bookSlug, chapter }).catch(() => {
          autoMarkedRef.current = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAuthenticated, isRead, markRead, bookSlug, chapter]);

  const toggleRead = useCallback(async () => {
    try {
      if (isRead) {
        await markUnread({ bookSlug, chapter });
      } else {
        await markRead({ bookSlug, chapter });
      }
    } catch {
      // Auth may not be ready; silently ignore
    }
  }, [isRead, markRead, markUnread, bookSlug, chapter]);

  const readCount = progress ? Object.keys(progress).length : 0;
  const pct =
    totalChapters > 0 ? Math.round((readCount / totalChapters) * 100) : 0;

  if (!isSignedIn) return null;

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isRead ? "secondary" : "outline"}
        size="sm"
        className="gap-2 text-xs"
        onClick={toggleRead}
      >
        <CheckCircle
          className={`h-3.5 w-3.5 ${isRead ? "text-green-600" : "text-muted-foreground"}`}
        />
        {isRead ? "Read" : "Mark as read"}
      </Button>

      <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary/60 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono tabular-nums">
          {readCount}/{totalChapters}
        </span>
      </div>
    </div>
  );
}
