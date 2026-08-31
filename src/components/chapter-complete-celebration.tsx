"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Check, ArrowRight, X } from "lucide-react";

type Props = {
  bookName: string;
  chapter: number;
  /** Where to go next, if there is a next chapter. */
  nextHref?: string | null;
  nextLabel?: string | null;
  onDismiss: () => void;
};

/**
 * Chapter completion, as a toast rather than a full-screen overlay.
 *
 * It used to cover the whole viewport — including the closing verses someone
 * might want to sit with — behind a blurred backdrop, telling readers to "tap
 * anywhere to continue" while actually dismissing itself after 3.2s. Now it
 * sits in the corner, carries the next chapter, and stays out of the text.
 */
export function ChapterCompleteCelebration({
  bookName,
  chapter,
  nextHref,
  nextLabel,
  onDismiss,
}: Props) {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onDismiss, 250);
  }, [onDismiss]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(dismiss, 6000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [dismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed z-50 right-4 left-4 sm:left-auto sm:w-80 bottom-[calc(var(--tabbar-clearance)+1rem)] md:bottom-6
        rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-sm
        transition-all duration-300 motion-reduce:transition-none ${
          visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Check className="h-4 w-4 text-primary" strokeWidth={3} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold">Chapter complete</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {bookName} {chapter}
          </p>

          {nextHref && (
            <Link
              href={nextHref}
              onClick={dismiss}
              className="mt-2.5 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Read {nextLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="-m-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
