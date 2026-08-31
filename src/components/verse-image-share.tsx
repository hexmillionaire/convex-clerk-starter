"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ImageDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function generateVerseImage(reference: string, text: string): string {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Background — warm parchment gradient
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#faf6ef");
  bg.addColorStop(0.5, "#f5ede0");
  bg.addColorStop(1, "#efe5d4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle border
  ctx.strokeStyle = "#c9972b40";
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // Inner border
  ctx.strokeStyle = "#c9972b20";
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Top ornament
  ctx.font = "36px serif";
  ctx.fillStyle = "#c9972b";
  ctx.textAlign = "center";
  ctx.fillText("✦", width / 2, 120);

  // Verse text — italic serif
  ctx.font = 'italic 36px "Georgia", "Times New Roman", serif';
  ctx.fillStyle = "#2c1810";
  ctx.textAlign = "center";

  const maxW = width - 200;
  const verseLines = wrapText(ctx, `\u201C${text}\u201D`, maxW);

  // Calculate total text block height to center vertically
  const lineHeight = 54;
  const totalTextH = verseLines.length * lineHeight;
  const refH = 60; // space for reference below
  const totalBlockH = totalTextH + refH + 20;
  const startY = (height - totalBlockH) / 2 + lineHeight;

  verseLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight);
  });

  // Reference — gold, small caps style
  ctx.font = '600 28px "Georgia", "Times New Roman", serif';
  ctx.fillStyle = "#c9972b";
  ctx.fillText(`— ${reference}`, width / 2, startY + totalTextH + 40);

  // Bottom branding
  ctx.font = '14px "Georgia", "Times New Roman", serif';
  ctx.fillStyle = "#c9972b80";
  ctx.fillText("divineword.app", width / 2, height - 80);

  // Bottom ornament
  ctx.font = "24px serif";
  ctx.fillStyle = "#c9972b50";
  ctx.fillText("✦", width / 2, height - 110);

  return canvas.toDataURL("image/png");
}

export function VerseImageShare({
  reference,
  text,
  variant = "icon",
  autoOpen = false,
  onClosed,
}: {
  reference: string;
  text: string;
  /** "none" renders no trigger — for opening from the touch actions sheet. */
  variant?: "icon" | "button" | "none";
  /** Generate and open immediately on mount, with no trigger press. */
  autoOpen?: boolean;
  onClosed?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const generate = useCallback(() => {
    if (!text) return;
    setOpen(true);
    // Defer canvas work to avoid blocking the click
    requestAnimationFrame(() => {
      const url = generateVerseImage(reference, text);
      setImageUrl(url);
    });
  }, [reference, text]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${reference.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-")}.png`;
    a.click();
  }, [imageUrl, reference]);

  const handleShare = useCallback(async () => {
    if (!imageUrl) return;
    setSharing(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], "verse.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: reference,
          text: `"${text}" — ${reference} (KJV)`,
          files: [file],
        });
      } else {
        // Fallback: just download
        handleDownload();
      }
    } catch {
      // User cancelled or share not supported
    } finally {
      setSharing(false);
    }
  }, [imageUrl, reference, text, handleDownload]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setImageUrl(null);
    onClosed?.();
  }, [onClosed]);

  // Opened from the touch actions sheet: there is no trigger to press, so the
  // image is generated as soon as this mounts.
  const autoOpened = useRef(false);
  useEffect(() => {
    if (!autoOpen || autoOpened.current) return;
    autoOpened.current = true;
    generate();
  }, [autoOpen, generate]);

  if (!text) return null;

  return (
    <>
      {variant === "icon" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            generate();
          }}
          aria-label={`Share ${reference} as an image`}
        >
          <ImageDown className="h-3 w-3" />
        </Button>
      )}
      {variant === "button" && (
        <Button variant="outline" className="gap-2" onClick={generate}>
          <ImageDown className="h-4 w-4" />
          Image
        </Button>
      )}

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="max-w-md p-4">
          <DialogTitle className="text-sm font-heading font-semibold">
            Share Verse as Image
          </DialogTitle>

          {imageUrl ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={reference}
                className="w-full rounded-md border"
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={handleShare}
                  disabled={sharing}
                >
                  {sharing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageDown className="h-4 w-4" />
                  )}
                  Share
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownload}
                >
                  Save Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
