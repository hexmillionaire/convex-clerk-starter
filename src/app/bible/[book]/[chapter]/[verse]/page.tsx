import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getBookBySlug, cleanVerseText } from "@/lib/bible-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { VerseActions } from "./verse-actions";

type Props = {
  params: Promise<{ book: string; chapter: string; verse: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book: bookSlug, chapter: chapterStr, verse: verseStr } = await params;
  const book = getBookBySlug(bookSlug);
  const chapter = parseInt(chapterStr, 10);
  const verse = parseInt(verseStr, 10);

  if (!book || isNaN(chapter) || isNaN(verse)) {
    return { title: "Not Found" };
  }

  return {
    title: `${book.name} ${chapter}:${verse}`,
    description: `Read ${book.name} ${chapter}:${verse} in the King James Version (KJV). Free online Bible.`,
    openGraph: {
      title: `${book.name} ${chapter}:${verse} — KJV`,
      description: `Read ${book.name} ${chapter}:${verse} in the King James Version.`,
    },
  };
}

export default async function VersePage({ params }: Props) {
  const { book: bookSlug, chapter: chapterStr, verse: verseStr } = await params;
  const book = getBookBySlug(bookSlug);
  const chapter = parseInt(chapterStr, 10);
  const verseNum = parseInt(verseStr, 10);

  if (!book || isNaN(chapter) || isNaN(verseNum) || chapter < 1 || chapter > book.chapters) {
    notFound();
  }

  // Fetch the specific verse
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let verseText = "";

  try {
    const res = await fetch(
      `${baseUrl}/api/bible/${bookSlug}/${chapter}`,
      { next: { revalidate: 86400 } }
    );
    if (res.ok) {
      const data = await res.json();
      const found = data.verses?.find((v: { verse: number }) => v.verse === verseNum);
      if (found) verseText = found.text;
    }
  } catch {
    // proceed with empty text
  }

  const reference = `${book.name} ${chapter}:${verseNum}`;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <Link
        href={`/bible/${bookSlug}/${chapter}#v${verseNum}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {book.name} {chapter}
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

      <Card className="border-primary/20 shadow-lg mb-8">
        <CardContent className="p-8 md:p-12 text-center">
          {verseText ? (
            <blockquote className="text-xl md:text-2xl leading-relaxed italic">
              &ldquo;{cleanVerseText(verseText)}&rdquo;
            </blockquote>
          ) : (
            <p className="text-muted-foreground italic">
              Connect your database to load this verse.
            </p>
          )}
          <p className="text-primary font-heading font-semibold mt-6 tracking-wide">
            — {reference}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <VerseActions reference={reference} text={verseText ? cleanVerseText(verseText) : ""} />
        <Link href={`/bible/${bookSlug}/${chapter}`}>
          <Button variant="secondary" className="gap-2">
            Read Full Chapter
          </Button>
        </Link>
      </div>
    </div>
  );
}
