import { NextResponse } from "next/server";
import { getBookBySlug, BIBLE_BOOKS, cleanVerseText } from "@/lib/bible-data";

// Map book slugs to Bolls.life book IDs (1-66)
function getBookId(slug: string): number | null {
  const book = BIBLE_BOOKS.find((b) => b.slug === slug);
  return book ? book.position : null;
}

type Props = {
  params: Promise<{ book: string; chapter: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { book: bookSlug, chapter: chapterStr } = await params;
  const book = getBookBySlug(bookSlug);
  const chapter = parseInt(chapterStr, 10);

  if (!book || isNaN(chapter) || chapter < 1 || chapter > book.chapters) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch from Bolls.life free API (no key needed)
  const bookId = getBookId(bookSlug);
  if (!bookId) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  try {
    const res = await fetch(
      `https://bolls.life/get-text/KJV/${bookId}/${chapter}/`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch verses" },
        { status: 502 }
      );
    }

    const data: { pk: number; verse: number; text: string }[] = await res.json();

    const verses = data.map((v) => ({
      verse: v.verse,
      text: cleanVerseText(v.text),
    }));

    return NextResponse.json({
      book: book.name,
      bookSlug: book.slug,
      chapter,
      translation: "KJV",
      verses,
    });
  } catch {
    return NextResponse.json(
      { error: "External API unavailable" },
      { status: 502 }
    );
  }
}
