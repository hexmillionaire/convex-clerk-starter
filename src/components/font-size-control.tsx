"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const FONT_SIZES = [14, 16, 18, 20, 22, 24];
const DEFAULT_INDEX = 2; // 18px

export function FontSizeControl() {
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_INDEX);

  const decrease = () => {
    if (sizeIndex > 0) {
      const newIndex = sizeIndex - 1;
      setSizeIndex(newIndex);
      document.documentElement.style.setProperty(
        "--reading-font-size",
        `${FONT_SIZES[newIndex]}px`
      );
    }
  };

  const increase = () => {
    if (sizeIndex < FONT_SIZES.length - 1) {
      const newIndex = sizeIndex + 1;
      setSizeIndex(newIndex);
      document.documentElement.style.setProperty(
        "--reading-font-size",
        `${FONT_SIZES[newIndex]}px`
      );
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={decrease}
        disabled={sizeIndex === 0}
      >
        <Minus className="h-3 w-3" />
        <span className="sr-only">Decrease font size</span>
      </Button>
      <span className="text-xs text-muted-foreground w-8 text-center font-mono">
        {FONT_SIZES[sizeIndex]}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={increase}
        disabled={sizeIndex === FONT_SIZES.length - 1}
      >
        <Plus className="h-3 w-3" />
        <span className="sr-only">Increase font size</span>
      </Button>
    </div>
  );
}
