"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Share2,
  List,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
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
import { TranslationSwitcher, type Translation } from "@/components/translation-switcher";
import { HighlightPicker } from "@/components/highlight-picker";
import { ReadingProgress } from "@/components/reading-progress";

type Props = {
  book: BookInfo;
  chapter: number;
};

export function ChapterReader({ book, chapter }: Props) {
  const { isAuthenticated } = useConvexAuth();
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [translation, setTranslation] = useState<Translation>("KJV");
  const [apiVerses, setApiVerses] = useState<
    { verse: number; text: string }[] | null
  >(null);
  const [loadingApi, setLoadingApi] = useState(false);

  // Convex queries
  const convexVerses = useQuery(api.bible.getChapter, {
    bookSlug: book.slug,
    chapter,
    translation,
  });
  const highlights = useQuery(api.highlights.getForChapter, {
    bookSlug: book.slug,
    chapter,
  });
  const bookmarks = useQuery(api.bookmarks.list);

  // Convex mutations
  const addBookmark = useMutation(api.bookmarks.add);
  const removeBookmark = useMutation(api.bookmarks.remove);
  const setHighlight = useMutation(api.highlights.set);
  const removeHighlight = useMutation(api.highlights.remove);

  // Fetch from external API as fallback
  const fetchFromAPI = useAction(api.bible.fetchChapterFromAPI);

  useEffect(() => {
    if (convexVerses && convexVerses.length === 0 && !apiVerses && !loadingApi) {
      setLoadingApi(true);
      fetchFromAPI({
        bookSlug: book.slug,
        bookId: book.position,
        chapter,
        translation,
      })
        .then((data) => setApiVerses(data))
        .catch(() => setApiVerses([]))
        .finally(() => setLoadingApi(false));
    }
  }, [convexVerses, apiVerses, loadingApi, fetchFromAPI, book.slug, book.position, chapter, translation]);

  // Reset API verses when navigating or changing translation
  useEffect(() => {
    setApiVerses(null);
    setLoadingApi(false);
  }, [book.slug, chapter, translation]);

  // Determine which verses to display
  const verses =
    convexVerses && convexVerses.length > 0
      ? convexVerses.map((v) => ({ verse: v.verseNumber, text: v.text }))
      : apiVerses ?? [];

  const isLoading =
    convexVerses === undefined || (convexVerses.length === 0 && loadingApi);

  // Build a set of bookmarked verse numbers for this chapter
  const bookmarkedVerses = new Set(
    (bookmarks ?? [])
      .filter((b) => b.bookSlug === book.slug && b.chapter === chapter)
      .map((b) => b.verseNumber)
  );

  const handleHighlight = useCallback(
    async (verseNum: number, color: string | null) => {
      if (!isAuthenticated) return;
      if (color === null) {
        await removeHighlight({
          bookSlug: book.slug,
          chapter,
          verseNumber: verseNum,
        });
      } else {
        await setHighlight({
          bookSlug: book.slug,
          chapter,
          verseNumber: verseNum,
          color,
        });
      }
    },
    [isAuthenticated, setHighlight, removeHighlight, book.slug, chapter]
  );

  const handleBookmark = useCallback(
    async (verseNum: number, text: string) => {
      if (!isAuthenticated) return;
      const isMarked = bookmarkedVerses.has(verseNum);

      if (isMarked) {
        const bm = (bookmarks ?? []).find(
          (b) =>
            b.bookSlug === book.slug &&
            b.chapter === chapter &&
            b.verseNumber === verseNum
        );
        if (bm) await removeBookmark({ id: bm._id });
      } else {
        await addBookmark({
          bookSlug: book.slug,
          chapter,
          verseNumber: verseNum,
          reference: `${book.name} ${chapter}:${verseNum}`,
          text: cleanVerseText(text),
        });
      }
    },
    [
      isAuthenticated,
      bookmarks,
      bookmarkedVerses,
      addBookmark,
      removeBookmark,
      book.slug,
      book.name,
      chapter,
    ]
  );

  const prevChapterInfo = (() => {
    if (chapter > 1) {
      return { href: `/bible/${book.slug}/${chapter - 1}`, label: `${book.name} ${chapter - 1}` };
    }
    if (book.position > 1) {
      const prevBook = BIBLE_BOOKS.find((b) => b.position === book.position - 1);
      if (prevBook) return { href: `/bible/${prevBook.slug}/${prevBook.chapters}`, label: `${prevBook.name} ${prevBook.chapters}` };
    }
    return null;
  })();

  const nextChapterInfo = (() => {
    if (chapter < book.chapters) {
      return { href: `/bible/${book.slug}/${chapter + 1}`, label: `${book.name} ${chapter + 1}` };
    }
    if (book.position < 66) {
      const nextBook = BIBLE_BOOKS.find((b) => b.position === book.position + 1);
      if (nextBook) return { href: `/bible/${nextBook.slug}/1`, label: `${nextBook.name} 1` };
    }
    return null;
  })();

  const copyVerse = async (verseNum: number, text: string) => {
    const clean = cleanVerseText(text);
    const citation = `${book.name} ${chapter}:${verseNum} (${translation})\n"${clean}"`;
    await navigator.clipboard.writeText(citation);
    setCopiedVerse(verseNum);
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  const shareVerse = async (verseNum: number, text: string) => {
    const clean = cleanVerseText(text);
    const shareData = {
      title: `${book.name} ${chapter}:${verseNum}`,
      text: `"${clean}" — ${book.name} ${chapter}:${verseNum} (${translation})`,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.text);
      setCopiedVerse(verseNum);
      setTimeout(() => setCopiedVerse(null), 2000);
    }
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
            <TranslationSwitcher value={translation} onChange={setTranslation} />
            <span className="text-sm text-muted-foreground font-mono">
              · {book.testament === "OLD" ? "Old" : "New"} Testament
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chapter picker sheet */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="sm" className="gap-2" />
              }
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
                  {Array.from(
                    { length: book.chapters },
                    (_, i) => i + 1
                  ).map((ch) => (
                    <Link key={ch} href={`/bible/${book.slug}/${ch}`}>
                      <Button
                        variant={ch === chapter ? "default" : "outline"}
                        size="sm"
                        className="w-full text-sm"
                      >
                        {ch}
                      </Button>
                    </Link>
                  ))}
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
                        b.slug === book.slug ? "bg-muted font-semibold" : ""
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
        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">
              Loading scripture...
            </p>
          </div>
        ) : verses.length > 0 ? (
          <div className="space-y-1">
            {verses.map((v) => {
              const highlightColor = highlights?.[v.verse];
              const isMarked = bookmarkedVerses.has(v.verse);

              return (
                <div
                  key={v.verse}
                  id={`v${v.verse}`}
                  className="group flex gap-3 py-1.5 px-2 -mx-2 rounded-sm hover:bg-muted/50 transition-colors"
                  style={
                    highlightColor
                      ? { backgroundColor: highlightColor + "30" }
                      : undefined
                  }
                >
                  <span className="text-xs text-primary/60 font-mono mt-1.5 min-w-6 text-right select-none">
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
                    {isAuthenticated && (
                      <>
                        <HighlightPicker
                          verseId={`v${v.verse}`}
                          currentColor={highlightColor ?? null}
                          onHighlight={(_id, color) =>
                            handleHighlight(v.verse, color)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleBookmark(v.verse, v.text)}
                        >
                          {isMarked ? (
                            <BookmarkCheck className="h-3 w-3 text-primary" />
                          ) : (
                            <Bookmark className="h-3 w-3" />
                          )}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => shareVerse(v.verse, v.text)}
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground italic">
              Unable to load scripture text. Please try again later.
            </p>
          </div>
        )}
      </article>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-6">
        {prevChapterInfo ? (
          <Link href={prevChapterInfo.href}>
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{prevChapterInfo.label}</span>
              <span className="sm:hidden">Previous</span>
            </Button>
          </Link>
        ) : (
          <div />
        )}

        <span className="text-sm text-muted-foreground font-mono">
          {book.abbreviation} {chapter}
        </span>

        {nextChapterInfo ? (
          <Link href={nextChapterInfo.href}>
            <Button variant="outline" className="gap-2">
              <span className="hidden sm:inline">{nextChapterInfo.label}</span>
              <span className="sm:hidden">Next</span>
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
