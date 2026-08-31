"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Minus, Plus, Sun, Moon, Palette, Settings2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FONT_SIZES } from "@/lib/reading-prefs";
import { useFontSizeIndex, useTranslation } from "@/lib/use-reading-prefs";
import { TRANSLATIONS } from "@/lib/bible-data";
import { useIsCompact } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "sepia", label: "Sepia", icon: Palette },
] as const;

/**
 * Text size, translation and theme in one place, reachable at every breakpoint.
 *
 * The size stepper used to live in the navbar behind `hidden sm:flex`, so it
 * was missing on phones — where readers most want it — and the translation
 * switcher sat separately in the chapter header. They belong together, next to
 * the text they affect.
 */
export function ReadingSettings() {
  const isCompact = useIsCompact();
  const [sizeIndex, setSizeIndex] = useFontSizeIndex();
  const [translation, setTranslation] = useTranslation();
  const { theme, setTheme } = useTheme();

  // Keep the document in step with the stored size (the inline script in <head>
  // has already applied it before first paint).
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--reading-font-size",
      `${FONT_SIZES[sizeIndex]}px`
    );
  }, [sizeIndex]);

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline" size="sm" className="h-9 gap-2" />}
        aria-label="Reading settings"
      >
        <Settings2 className="h-4 w-4" />
        <span className="hidden sm:inline">Display</span>
      </SheetTrigger>

      <SheetContent
        side={isCompact ? "bottom" : "right"}
        className={cn(
          "gap-0",
          isCompact && "rounded-t-2xl pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        )}
      >
        {isCompact && (
          <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-border" />
        )}

        <div className="px-5 pt-4 pb-2">
          <SheetTitle className="text-base">Display</SheetTitle>
        </div>

        <div className="flex flex-col gap-7 px-5 py-4">
          {/* ── Text size ─────────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <Label>Text size</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-11 w-11 shrink-0 p-0"
                aria-label="Decrease text size"
                disabled={sizeIndex === 0}
                onClick={() => setSizeIndex(sizeIndex - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="flex h-11 flex-1 items-center justify-center rounded-lg border bg-muted/40 font-mono text-sm tabular-nums">
                {FONT_SIZES[sizeIndex]}px
              </div>

              <Button
                variant="outline"
                className="h-11 w-11 shrink-0 p-0"
                aria-label="Increase text size"
                disabled={sizeIndex === FONT_SIZES.length - 1}
                onClick={() => setSizeIndex(sizeIndex + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p
              className="text-muted-foreground leading-relaxed"
              style={{ fontSize: `${FONT_SIZES[sizeIndex]}px` }}
            >
              In the beginning was the Word.
            </p>
          </section>

          {/* ── Translation ───────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <Label>Translation</Label>
            <div className="grid grid-cols-3 gap-2">
              {TRANSLATIONS.map((t) => (
                <Button
                  key={t}
                  variant={translation === t ? "default" : "outline"}
                  className="h-11 font-mono text-xs"
                  aria-pressed={translation === t}
                  onClick={() => setTranslation(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </section>

          {/* ── Theme ─────────────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={theme === value ? "default" : "outline"}
                  className="h-11 flex-col gap-1 text-xs"
                  aria-pressed={theme === value}
                  onClick={() => setTheme(value)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.625rem] tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}
