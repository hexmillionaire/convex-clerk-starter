import { NextRequest, NextResponse } from "next/server";
import { BIBLE_BOOKS, cleanVerseText } from "@/lib/bible-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2 || query.length > 200) {
    return NextResponse.json(
      { error: "Query must be between 2 and 200 characters" },
      { status: 400 }
    );
  }

  // Use Bolls.life search API
  try {
    const res = await fetch(
      `https://bolls.life/search/KJV/${encodeURIComponent(query)}/`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Search service unavailable" },
        { status: 502 }
      );
    }

    const data: { pk: number; translation: string; book: number; chapter: number; verse: number; text: string }[] =
      await res.json();

    // Map book (1-66) back to our book data
    const results = data.slice(0, 50).map((item) => {
      const book = BIBLE_BOOKS.find((b) => b.position === item.book);
      return {
        bookName: book?.name || "Unknown",
        bookSlug: book?.slug || "",
        chapter: item.chapter,
        verse: item.verse,
        text: cleanVerseText(item.text),
      };
    });

    return NextResponse.json({ results, total: data.length });
  } catch {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
