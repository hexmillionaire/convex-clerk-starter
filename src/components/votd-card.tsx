"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, BookOpen, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerseImageShare } from "@/components/verse-image-share";
import type { DailyVerse } from "@/lib/daily-verses";
import { cn } from "@/lib/utils";

// Simple AI explanations keyed by verse ref — acts as fallback / cache
const EXPLANATIONS: Record<string, string> = {};

export function VotdCard({ verse }: { verse: DailyVerse }) {
  const [showExplain, setShowExplain] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleExplain() {
    if (explanation) {
      setShowExplain((p) => !p);
      return;
    }
    setShowExplain(true);
    setLoading(true);

    // Check cache
    if (EXPLANATIONS[verse.ref]) {
      setExplanation(EXPLANATIONS[verse.ref]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/explain-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: verse.ref, text: verse.text }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const text = data.explanation ?? "Unable to load explanation right now.";
      EXPLANATIONS[verse.ref] = text;
      setExplanation(text);
    } catch {
      setExplanation(
        "This verse reminds us of God's enduring love and faithfulness. Take a moment to reflect on how it speaks to your life today."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pt-10 pb-8 md:pt-16 md:pb-12">
      <div className="container max-w-2xl mx-auto px-6">
        {/* Label */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">
            Today&apos;s Verse
          </span>
        </div>

        {/* Verse card */}
        <Card className="border-primary/10 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <blockquote className="text-2xl md:text-3xl leading-normal italic text-center mb-6 font-serif">
              &ldquo;{verse.text}&rdquo;
            </blockquote>
            <div className="text-center mb-8">
              <Link
                href={`/bible/${verse.book}/${verse.chapter}#v${verse.verse}`}
                className="text-primary hover:underline font-heading font-semibold tracking-wide text-sm"
              >
                — {verse.ref} (KJV)
              </Link>
            </div>

            {/* Actions row */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={`/bible/${verse.book}/${verse.chapter}#v${verse.verse}`}>
                <Button variant="outline" size="sm" className="gap-2 text-xs rounded-full px-5 h-9">
                  <BookOpen className="h-3.5 w-3.5" />
                  Read Context
                </Button>
              </Link>
              <VerseImageShare reference={verse.ref} text={verse.text} />
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs rounded-full px-5 h-9"
                onClick={async () => {
                  const shareText = `"${verse.text}" — ${verse.ref} (KJV)\n\nVia Divine Word: https://www.divineword.app`;
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: `Verse of the Day: ${verse.ref}`, text: shareText });
                    } else {
                      await navigator.clipboard.writeText(shareText);
                    }
                  } catch { /* user cancelled */ }
                }}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </div>

            {/* AI Explain */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleExplain}
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground",
                  "hover:text-primary transition-colors duration-300 cursor-pointer py-2"
                )}
              >
                <Sparkles className="h-3 w-3" />
                {showExplain && explanation ? "Hide Explanation" : "Explain This Verse"}
              </button>
            </div>

            {showExplain && (
              <div className="mt-5 rounded-xl bg-muted/40 p-5 animate-in fade-in slide-in-from-top-2 duration-300">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                ) : (
                  <p className="text-sm leading-[1.8] text-muted-foreground">
                    {explanation}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
