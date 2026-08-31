import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getBookBySlug } from "@/lib/bible-data";
import { getChapter, getVerse } from "@/lib/kjv";
import { socialMetadata } from "@/lib/metadata";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VerseActions } from "./verse-actions";

type Props = {
  params: Promise<{ book: string; chapter: string; verse: string }>;
};

export const revalidate = 604800;



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book: bookSlug, chapter: chapterStr, verse: verseStr } = await params;
  const book = getBookBySlug(bookSlug);
  const chapter = parseInt(chapterStr, 10);
  const verse = parseInt(verseStr, 10);

  if (!book || isNaN(chapter) || isNaN(verse)) {
    return { title: "Not Found" };
  }

  const ref = `${book.name} ${chapter}:${verse}`;
  const text = await getVerse(bookSlug, chapter, verse);

  return socialMetadata({
    title: `${ref} KJV — Divine Word`,
    description: text
      ? `“${text}” — ${ref}, King James Version. Read it in context free at Divine Word.`
      : `Read ${ref} in the King James Version (KJV). Free online Bible.`,
    // Verse pages point at their chapter: the chapter is the page worth
    // ranking, and 30,856 near-duplicate one-line pages would only compete
    // with it for crawl budget.
    canonical: `/bible/${bookSlug}/${chapter}`,
    ogImage: `/og?book=${bookSlug}&chapter=${chapter}&verse=${verse}`,
    type: "article",
  });
}

export default async function VersePage({ params }: Props) {
  const { book: bookSlug, chapter: chapterStr, verse: verseStr } = await params;
  const book = getBookBySlug(bookSlug);
  const chapter = parseInt(chapterStr, 10);
  const verseNum = parseInt(verseStr, 10);

  if (!book || isNaN(chapter) || isNaN(verseNum) || chapter < 1 || chapter > book.chapters) {
    notFound();
  }

  const verses = (await getChapter(bookSlug, chapter)) ?? [];
  if (verses.length === 0) notFound();

  const currentVerse = verses.find((v) => v.verse === verseNum);
  // The chapter exists but this verse doesn't — the reader was after this
  // passage, so send them to it rather than to a dead end.
  if (!currentVerse) redirect(`/bible/${bookSlug}/${chapter}`);

  const verseText = currentVerse.text;
  const reference = `${book.name} ${chapter}:${verseNum}`;

  // Surrounding context (3 verses before/after)
  const contextVerses = verses.filter(
    (v) => v.verse >= verseNum - 3 && v.verse <= verseNum + 3
  );

  // Prev/next verse nav
  const maxVerse = verses.length > 0 ? verses[verses.length - 1].verse : 0;
  const prevVerse =
    verseNum > 1
      ? `/bible/${bookSlug}/${chapter}/${verseNum - 1}`
      : null;
  const nextVerse =
    verseNum < maxVerse
      ? `/bible/${bookSlug}/${chapter}/${verseNum + 1}`
      : null;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    name: `${reference} KJV`,
    headline: reference,
    text: verseText,
    isPartOf: {
      "@type": "Book",
      name: "The Holy Bible, King James Version",
    },
    publisher: {
      "@type": "Organization",
      name: "Divine Word",
      url: "https://www.divineword.app",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Bible",
        item: "https://www.divineword.app/bible",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: book.name,
        item: `https://www.divineword.app/bible/${bookSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Chapter ${chapter}`,
        item: `https://www.divineword.app/bible/${bookSlug}/${chapter}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `Verse ${verseNum}`,
        item: `https://www.divineword.app/bible/${bookSlug}/${chapter}/${verseNum}`,
      },
    ],
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, '\\u003c') }}
      />

      <Link
        href={`/bible/${bookSlug}/${chapter}#v${verseNum}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {book.name} {chapter}
      </Link>

      <div className="text-center mb-8">
        <p className="text-primary text-lg mb-2">✦</p>
        <h1 className="text-2xl md:text-3xl font-heading font-semibold">
          {reference}
        </h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          King James Version
        </p>
      </div>

      {/* Featured verse */}
      <Card className="border-primary/20 shadow-lg mb-8">
        <CardContent className="p-8 md:p-12 text-center">
          {verseText ? (
            <blockquote className="text-xl md:text-2xl leading-relaxed italic">
              &ldquo;{verseText}&rdquo;
            </blockquote>
          ) : (
            <p className="text-muted-foreground italic">
              Unable to load this verse. Please try again later.
            </p>
          )}
          <p className="text-primary font-heading font-semibold mt-6 tracking-wide">
            — {reference}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-3 mb-12">
        <VerseActions reference={reference} text={verseText} />
        <Link href={`/bible/${bookSlug}/${chapter}`}>
          <Button variant="secondary" className="gap-2">
            Read Full Chapter
          </Button>
        </Link>
      </div>

      {/* Surrounding context */}
      {contextVerses.length > 1 && (
        <section className="mb-12">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
            Context
          </h2>
          <div className="space-y-1">
            {contextVerses.map((v) => (
              <Link
                key={v.verse}
                href={`/bible/${bookSlug}/${chapter}/${v.verse}`}
                className={`flex gap-3 py-2 px-3 -mx-3 rounded-sm transition-colors ${
                  v.verse === verseNum
                    ? "bg-primary/10 font-medium"
                    : "hover:bg-muted/50"
                }`}
              >
                <span className="text-xs text-primary/60 font-mono mt-1 min-w-6 text-right select-none">
                  {v.verse}
                </span>
                <span className="flex-1 text-sm leading-relaxed">{v.text}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Prev / Next verse navigation */}
      <div className="flex items-center justify-between border-t pt-6">
        {prevVerse ? (
          <Link href={prevVerse}>
            <Button variant="outline" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Verse {verseNum - 1}
            </Button>
          </Link>
        ) : (
          <div />
        )}
        <span className="text-xs text-muted-foreground font-mono">
          {book.abbreviation} {chapter}:{verseNum}
        </span>
        {nextVerse ? (
          <Link href={nextVerse}>
            <Button variant="outline" size="sm" className="gap-1">
              Verse {verseNum + 1}
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
