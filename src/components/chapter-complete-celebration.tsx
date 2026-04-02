"use client";

import { useEffect, useState, useCallback } from "react";

type Props = {
  bookName: string;
  chapter: number;
  onDismiss: () => void;
};

/**
 * Full-screen celebration overlay when a chapter is completed.
 * Shows animated checkmark, text, auto-dismisses after 3s.
 */
export function ChapterCompleteCelebration({
  bookName,
  chapter,
  onDismiss,
}: Props) {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    const t = setTimeout(onDismiss, 400);
    return () => clearTimeout(t);
  }, [onDismiss]);

  useEffect(() => {
    // Trigger entrance after mount
    const raf = requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      dismiss();
    }, 3200);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [dismiss]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-400 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={dismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Escape" && dismiss()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-64 h-64 rounded-full bg-green-400/10 transition-all duration-700 ${
            visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
      </div>

      {/* Content */}
      <div
        className={`relative text-center transition-all duration-500 ${
          visible
            ? "scale-100 translate-y-0"
            : "scale-90 translate-y-4"
        }`}
      >
        {/* Animated checkmark circle */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center chapter-complete-ring">
          <svg
            className="w-10 h-10 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              className="checkmark-draw"
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h3 className="text-2xl font-heading font-bold tracking-tight mb-1">
          Chapter Complete!
        </h3>
        <p className="text-muted-foreground text-sm font-mono">
          {bookName} {chapter}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-4">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
