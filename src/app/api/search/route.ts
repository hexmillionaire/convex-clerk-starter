import { NextRequest, NextResponse } from "next/server";
import { BIBLE_BOOKS } from "@/lib/bible-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  // TODO: Once DB is seeded, use Prisma full-text search:
  // const results = await prisma.$queryRaw`SELECT ... WHERE to_tsvector('english', text) @@ plainto_tsquery('english', ${query})`

  // Fallback: use Bolls.life search API
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

    const data: { bookid: number; chapter: number; verse: number; text: string }[] =
      await res.json();

    // Map bookid (1-66) back to our book data
    const results = data.slice(0, 50).map((item) => {
      const book = BIBLE_BOOKS.find((b) => b.position === item.bookid);
      return {
        bookName: book?.name || "Unknown",
        bookSlug: book?.slug || "",
        chapter: item.chapter,
        verse: item.verse,
        text: item.text.trim(),
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
