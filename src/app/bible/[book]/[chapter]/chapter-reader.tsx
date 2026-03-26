"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Bookmark,
  Share2,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type BookInfo, BIBLE_BOOKS, cleanVerseText } from "@/lib/bible-data";
import { TranslationSwitcher } from "@/components/translation-switcher";
import { HighlightPicker } from "@/components/highlight-picker";
import { ReadingProgress } from "@/components/reading-progress";

type Props = {
  book: BookInfo;
  chapter: number;
  verses: { verse: number; text: string }[];
};

export function ChapterReader({ book, chapter, verses }: Props) {
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Record<string, string>>({});

  const handleHighlight = useCallback((verseId: string, color: string | null) => {
    setHighlights((prev) => {
      if (color === null) {
        const next = { ...prev };
        delete next[verseId];
        return next;
      }
      return { ...prev, [verseId]: color };
    });
  }, []);

  const prevChapter = chapter > 1
    ? `/bible/${book.slug}/${chapter - 1}`
    : book.position > 1
    ? (() => {
        const prevBook = BIBLE_BOOKS.find((b) => b.position === book.position - 1);
        return prevBook ? `/bible/${prevBook.slug}/${prevBook.chapters}` : null;
      })()
    : null;

  const nextChapter = chapter < book.chapters
    ? `/bible/${book.slug}/${chapter + 1}`
    : book.position < 66
    ? (() => {
        const nextBook = BIBLE_BOOKS.find((b) => b.position === book.position + 1);
        return nextBook ? `/bible/${nextBook.slug}/1` : null;
      })()
    : null;

  const copyVerse = async (verseNum: number, text: string) => {
    const clean = cleanVerseText(text);
    const citation = `${book.name} ${chapter}:${verseNum} (KJV)\n"${clean}"`;
    await navigator.clipboard.writeText(citation);
    setCopiedVerse(verseNum);
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/bible`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wider"
          >
            ← All Books
          </Link>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold mt-1">
            {book.name}{" "}
            <span className="text-primary">{chapter}</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <TranslationSwitcher />
            <span className="text-sm text-muted-foreground font-mono">
              · {book.testament === "OLD" ? "Old" : "New"} Testament
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
        {/* Chapter picker sheet */}
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" size="sm" className="gap-2" />}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Chapters</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetTitle className="font-heading text-lg mb-4">
              {book.name}
            </SheetTitle>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map(
                  (ch) => (
                    <Link key={ch} href={`/bible/${book.slug}/${ch}`}>
                      <Button
                        variant={ch === chapter ? "default" : "outline"}
                        size="sm"
                        className="w-full text-sm"
                      >
                        {ch}
                      </Button>
                    </Link>
                  )
                )}
              </div>
              <Separator className="my-6" />
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">
                Other Books
              </p>
              <div className="flex flex-col gap-1">
                {BIBLE_BOOKS.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/bible/${b.slug}/1`}
                    className={`text-sm py-1.5 px-2 rounded-sm hover:bg-muted transition-colors ${
                      b.slug === book.slug
                        ? "bg-muted font-semibold"
                        : ""
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        </div>
      </div>

      {/* Reading progress */}
      <div className="mb-6">
        <ReadingProgress
          bookSlug={book.slug}
          chapter={chapter}
          totalChapters={book.chapters}
        />
      </div>

      {/* Verse content */}
      <article className="mb-12">
        {verses.length > 0 ? (
          <div className="space-y-1">
            {verses.map((v) => (
              <div
                key={v.verse}
                id={`v${v.verse}`}
                className="group flex gap-3 py-1.5 px-2 -mx-2 rounded-sm hover:bg-muted/50 transition-colors"
                style={
                  highlights[`v${v.verse}`]
                    ? { backgroundColor: highlights[`v${v.verse}`] + "30" }
                    : undefined
                }
              >
                <span className="text-xs text-primary/60 font-mono mt-1.5 min-w-[1.5rem] text-right select-none">
                  {v.verse}
                </span>
                <p className="verse-text flex-1">{cleanVerseText(v.text)}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-0.5 pt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyVerse(v.verse, v.text)}
                  >
                    {copiedVerse === v.verse ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <HighlightPicker
                    verseId={`v${v.verse}`}
                    currentColor={highlights[`v${v.verse}`] ?? null}
                    onHighlight={handleHighlight}
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Bookmark className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground italic">
              Connect your database to load scripture text, or configure the Bible API.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              See the seed script in <code className="font-mono text-xs">scripts/seed-kjv.ts</code>
            </p>
          </div>
        )}
      </article>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-6">
        {prevChapter ? (
          <Link href={prevChapter}>
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          </Link>
        ) : (
          <div />
        )}

        <span className="text-sm text-muted-foreground font-mono">
          {book.abbreviation} {chapter}
        </span>

        {nextChapter ? (
          <Link href={nextChapter}>
            <Button variant="outline" className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
