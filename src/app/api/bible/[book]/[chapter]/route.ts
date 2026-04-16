import { NextResponse } from "next/server";
import { getBookBySlug, BIBLE_BOOKS, cleanVerseText } from "@/lib/bible-data";

// Map book slugs to Bolls.life book IDs (1-66)
function getBookId(slug: string): number | null {
  const book = BIBLE_BOOKS.find((b) => b.slug === slug);
  return book ? book.position : null;
}

// Simple in-memory rate limiter: max 100 requests per IP per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count++;
  return entry.count > 100;
}

// Periodically clean up stale entries to avoid unbounded growth
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL = 120_000; // 2 minutes
  let lastCleanup = Date.now();
  const cleanup = () => {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  };
  const originalSet = rateLimitMap.set.bind(rateLimitMap);
  rateLimitMap.set = (key, value) => {
    cleanup();
    return originalSet(key, value);
  };
}

type Props = {
  params: Promise<{ book: string; chapter: string }>;
};

export async function GET(request: Request, { params }: Props) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

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

    return NextResponse.json(
      {
        book: book.name,
        bookSlug: book.slug,
        chapter,
        translation: "KJV",
        verses,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "External API unavailable" },
      { status: 502 }
    );
  }
}
