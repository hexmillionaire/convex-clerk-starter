"use client";

import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const FONT_SIZES = [14, 16, 18, 20, 22, 24];
const DEFAULT_INDEX = 2; // 18px
const STORAGE_KEY = "dw-font-size-index";

export function FontSizeControl() {
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_INDEX);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (idx >= 0 && idx < FONT_SIZES.length) {
        setSizeIndex(idx);
        document.documentElement.style.setProperty(
          "--reading-font-size",
          `${FONT_SIZES[idx]}px`
        );
      }
    }
  }, []);

  const applySize = (newIndex: number) => {
    setSizeIndex(newIndex);
    localStorage.setItem(STORAGE_KEY, String(newIndex));
    document.documentElement.style.setProperty(
      "--reading-font-size",
      `${FONT_SIZES[newIndex]}px`
    );
  };

  const decrease = () => {
    if (sizeIndex > 0) applySize(sizeIndex - 1);
  };

  const increase = () => {
    if (sizeIndex < FONT_SIZES.length - 1) applySize(sizeIndex + 1);
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
