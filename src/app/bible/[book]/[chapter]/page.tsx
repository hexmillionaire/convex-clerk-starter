import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBookBySlug } from "@/lib/bible-data";
import { ChapterReader } from "./chapter-reader";

type Props = {
  params: Promise<{ book: string; chapter: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book: bookSlug, chapter: chapterStr } = await params;
  const book = getBookBySlug(bookSlug);
  const chapter = parseInt(chapterStr, 10);

  if (!book || isNaN(chapter) || chapter < 1 || chapter > book.chapters) {
    return { title: "Not Found" };
  }

  return {
    title: `${book.name} ${chapter}`,
    description: `Read ${book.name} chapter ${chapter} in the King James Version (KJV). Free online Bible reading.`,
    openGraph: {
      title: `${book.name} ${chapter} — KJV`,
      description: `Read ${book.name} chapter ${chapter} in the King James Version.`,
    },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { book: bookSlug, chapter: chapterStr } = await params;
  const book = getBookBySlug(bookSlug);
  const chapter = parseInt(chapterStr, 10);

  if (!book || isNaN(chapter) || chapter < 1 || chapter > book.chapters) {
    notFound();
  }

  // Fetch verses from API route (works with or without DB — falls back to external API)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let verses: { verse: number; text: string }[] = [];

  try {
    const res = await fetch(
      `${baseUrl}/api/bible/${bookSlug}/${chapter}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      verses = data.verses || [];
    }
  } catch {
    // Will render with empty verses, client can retry
  }

  return (
    <ChapterReader
      book={book}
      chapter={chapter}
      verses={verses}
    />
  );
}
