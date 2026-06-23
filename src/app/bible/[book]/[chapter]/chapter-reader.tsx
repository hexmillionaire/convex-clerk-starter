"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { useQuery, useMutation, useAction, useConvexAuth } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { VerseImageShare } from "@/components/verse-image-share";
import { ReadingProgress } from "@/components/reading-progress";
import { AudioPlayer } from "@/components/audio-player";
import { ChapterCompleteCelebration } from "@/components/chapter-complete-celebration";

type Props = {
  book: BookInfo;
  chapter: number;
};

export function ChapterReader({ book, chapter }: Props) {
  const { isSignedIn } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const showAuthFeatures = !!isSignedIn;
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [translation, setTranslation] = useState<Translation>("KJV");
  const [apiVerses, setApiVerses] = useState<
    { verse: number; text: string }[] | null
  >(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Convex queries
  const convexVerses = useQuery(api.bible.getChapter, {
    bookSlug: book.slug,
    chapter,
    translation,
  });
  const highlights = useQuery(api.highlights.getForChapter, isAuthenticated ? {
    bookSlug: book.slug,
    chapter,
  } : "skip");
  const bookmarks = useQuery(api.bookmarks.list, isAuthenticated ? {} : "skip");

  // Convex mutations
  const addBookmark = useMutation(api.bookmarks.add);
  const removeBookmark = useMutation(api.bookmarks.remove);
  const setHighlight = useMutation(api.highlights.set);
  const removeHighlight = useMutation(api.highlights.remove);
  const updateHighlightNote = useMutation(api.highlights.updateNote);

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
  const bookmarkedVerses = useMemo(
    () => new Set(
      (bookmarks ?? [])
        .filter((b) => b.bookSlug === book.slug && b.chapter === chapter)
        .map((b) => b.verseNumber)
    ),
    [bookmarks, book.slug, chapter]
  );

  const handleHighlight = useCallback(
    async (verseNum: number, color: string | null, text?: string) => {
      if (!isAuthenticated) return;
      try {
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
            // Snapshot text + reference so the highlight is self-contained
            // (the dashboard/highlights views don't re-fetch scripture).
            text: text ? cleanVerseText(text) : undefined,
            reference: `${book.name} ${chapter}:${verseNum}`,
          });
        }
      } catch {
        // Auth token may not be synced yet
      }
    },
    [isAuthenticated, setHighlight, removeHighlight, book.slug, book.name, chapter]
  );

  const handleHighlightNote = useCallback(
    async (verseNum: number, note: string) => {
      if (!isAuthenticated) return;
      try {
        await updateHighlightNote({
          bookSlug: book.slug,
          chapter,
          verseNumber: verseNum,
          note: note.trim() || undefined,
        });
      } catch {
        // Auth token may not be synced yet
      }
    },
    [isAuthenticated, updateHighlightNote, book.slug, chapter]
  );

  const handleBookmark = useCallback(
    async (verseNum: number, text: string) => {
      if (!isAuthenticated) return;
      try {
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
      } catch {
        // Auth token may not be synced yet
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
    <div className="container max-w-3xl mx-auto px-6 py-10 md:py-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link
            href={`/bible`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300 font-mono uppercase tracking-[0.15em]"
          >
            ← All Books
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold mt-2 tracking-tight">
            {book.name}{" "}
            <span className="text-primary">{chapter}</span>
          </h1>
          <div className="flex items-center gap-2.5 mt-2">
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
      <div className="mb-8">
        <ReadingProgress
          bookSlug={book.slug}
          chapter={chapter}
          totalChapters={book.chapters}
          onComplete={() => setShowCelebration(true)}
        />
      </div>

      {/* Audio player */}
      {!isLoading && verses.length > 0 && (
        <div className="mb-8">
          <AudioPlayer
            verses={verses.map((v) => ({ verse: v.verse, text: cleanVerseText(v.text) }))}
            bookName={book.name}
            chapter={chapter}
            onVerseChange={(verse) => setSelectedVerse(verse || null)}
          />
        </div>
      )}

      {/* Verse content */}
      <article className="mb-16">
        {isLoading ? (
          <div className="space-y-5" aria-busy="true" aria-label="Loading scripture">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-5 mt-1 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[92%]" />
                  {i % 3 === 0 && <Skeleton className="h-4 w-[60%]" />}
                </div>
              </div>
            ))}
          </div>
        ) : verses.length > 0 ? (
          <div className="space-y-0.5">
            {verses.map((v) => {
              const highlightData = highlights?.[v.verse];
              const highlightColor = highlightData?.color ?? null;
              const isMarked = bookmarkedVerses.has(v.verse);
              const isSelected = selectedVerse === v.verse;

              return (
                <div
                  key={v.verse}
                  id={`v${v.verse}`}
                  className="group flex gap-4 py-2 px-3 -mx-3 rounded-xl hover:bg-muted/40 transition-colors duration-200 cursor-pointer"
                  style={
                    highlightColor
                      ? { backgroundColor: highlightColor + "25" }
                      : undefined
                  }
                  onClick={() => setSelectedVerse(isSelected ? null : v.verse)}
                >
                  <span className="text-xs text-primary/50 font-mono mt-2 min-w-7 text-right select-none">
                    {v.verse}
                  </span>
                  <p className="verse-text flex-1">{cleanVerseText(v.text)}</p>
                  <div className={`flex items-start gap-1 pt-1.5 transition-opacity duration-200 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); copyVerse(v.verse, v.text); }}
                    >
                      {copiedVerse === v.verse ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    {showAuthFeatures && (
                      <>
                        <HighlightPicker
                          verseId={`v${v.verse}`}
                          currentColor={highlightColor}
                          currentNote={highlightData?.note}
                          onHighlight={(_id, color) =>
                            handleHighlight(v.verse, color, v.text)
                          }
                          onNote={(_id, note) =>
                            handleHighlightNote(v.verse, note)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); handleBookmark(v.verse, v.text); }}
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
                      onClick={(e) => { e.stopPropagation(); shareVerse(v.verse, v.text); }}
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <VerseImageShare
                      reference={`${book.name} ${chapter}:${v.verse}`}
                      text={cleanVerseText(v.text)}
                    />
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
      <div className="flex items-center justify-between border-t pt-8">
        {prevChapterInfo ? (
          <Link href={prevChapterInfo.href}>
            <Button variant="outline" className="gap-2.5 rounded-full px-6">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{prevChapterInfo.label}</span>
              <span className="sm:hidden">Previous</span>
            </Button>
          </Link>
        ) : (
          <div />
        )}

        <span className="text-sm text-muted-foreground font-mono">
          {book.name} {chapter}
        </span>

        {nextChapterInfo ? (
          <Link href={nextChapterInfo.href}>
            <Button variant="outline" className="gap-2.5 rounded-full px-6">
              <span className="hidden sm:inline">{nextChapterInfo.label}</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Chapter completion celebration overlay */}
      {showCelebration && (
        <ChapterCompleteCelebration
          bookName={book.name}
          chapter={chapter}
          onDismiss={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}
