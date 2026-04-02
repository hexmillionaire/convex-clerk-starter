"use client";

import { useState } from "react";
import { Highlighter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HIGHLIGHT_COLORS } from "@/lib/bible-data";

type Props = {
  verseId: string;
  currentColor?: string | null;
  onHighlight: (verseId: string, color: string | null) => void;
};

export function HighlightPicker({ verseId, currentColor, onHighlight }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <Highlighter
          className="h-3 w-3"
          style={currentColor ? { color: currentColor } : undefined}
        />
      </Button>

      {open && (
        <div
          className="absolute right-0 top-8 z-50 flex items-center gap-1 rounded-lg border bg-popover p-1.5 shadow-md animate-in fade-in-0 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.value}
              className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              style={{
                backgroundColor: c.value,
                borderColor:
                  currentColor === c.value
                    ? "var(--foreground)"
                    : "transparent",
              }}
              title={c.name}
              onClick={(e) => {
                e.stopPropagation();
                onHighlight(verseId, c.value);
                setOpen(false);
              }}
            />
          ))}
          {currentColor && (
            <button
              className="ml-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
              title="Remove highlight"
              onClick={(e) => {
                e.stopPropagation();
                onHighlight(verseId, null);
                setOpen(false);
              }}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
