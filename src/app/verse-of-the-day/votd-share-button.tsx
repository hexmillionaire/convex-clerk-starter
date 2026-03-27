"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VotdShareButton({ reference, text }: { reference: string; text: string }) {
  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={async () => {
        const shareText = `"${text}" — ${reference} (KJV)\n\nVia Divine Word: https://www.divineword.app/verse-of-the-day`;
        if (navigator.share) {
          await navigator.share({ title: `Verse of the Day: ${reference}`, text: shareText });
        } else {
          await navigator.clipboard.writeText(shareText);
        }
      }}
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
}
