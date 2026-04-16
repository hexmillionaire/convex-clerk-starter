import { NextRequest, NextResponse } from "next/server";
import { BIBLE_BOOKS, cleanVerseText } from "@/lib/bible-data";

// Simple in-memory rate limiter: max 30 requests per IP per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count++;
  return entry.count > 30;
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
  // Attach to the map's set to piggyback cleanup on writes
  const originalSet = rateLimitMap.set.bind(rateLimitMap);
  rateLimitMap.set = (key, value) => {
    cleanup();
    return originalSet(key, value);
  };
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

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
      { next: { revalidate: 86400 } }
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
