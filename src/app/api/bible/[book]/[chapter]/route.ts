import { NextResponse } from "next/server";
import { getBookBySlug } from "@/lib/bible-data";
import { getChapterInTranslation, normalizeTranslation } from "@/lib/kjv";

/**
 * Chapter text for the reader.
 *
 * KJV now comes from the vendored scripture in `src/data/kjv/` and never
 * touches the network; the reader gets it server-rendered and only calls this
 * route for WEB and ASV, or when the service worker replays a cached response
 * offline. The route stays for the service worker's sake and for anyone who has
 * a chapter URL cached from an earlier version.
 */

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

  const { searchParams } = new URL(request.url);
  const translation = normalizeTranslation(searchParams.get("translation"));

  const verses = await getChapterInTranslation(book, chapter, translation);

  if (verses.length === 0) {
    // KJV is local, so an empty result here can only mean the upstream
    // translation is unavailable.
    return NextResponse.json(
      { error: "Translation unavailable" },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      book: book.name,
      bookSlug: book.slug,
      chapter,
      translation,
      verses,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
