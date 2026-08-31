"use client";

import { useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FONT_SIZES } from "@/lib/reading-prefs";
import { useFontSizeIndex } from "@/lib/use-reading-prefs";

export function FontSizeControl() {
  const [sizeIndex, setSizeIndex] = useFontSizeIndex();

  // Mirror the stored size onto the document. The inline script in <head> has
  // already done this before first paint; this keeps it in step with changes.
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--reading-font-size",
      `${FONT_SIZES[sizeIndex]}px`
    );
  }, [sizeIndex]);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setSizeIndex(sizeIndex - 1)}
        disabled={sizeIndex === 0}
      >
        <Minus className="h-3 w-3" />
        <span className="sr-only">Decrease font size</span>
      </Button>
      <span className="text-xs text-muted-foreground w-8 text-center font-mono tabular-nums">
        {FONT_SIZES[sizeIndex]}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setSizeIndex(sizeIndex + 1)}
        disabled={sizeIndex === FONT_SIZES.length - 1}
      >
        <Plus className="h-3 w-3" />
        <span className="sr-only">Increase font size</span>
      </Button>
    </div>
  );
}
