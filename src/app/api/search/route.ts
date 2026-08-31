import { NextRequest, NextResponse } from "next/server";
import { searchScripture } from "@/lib/search";

/**
 * Scripture search, served from the vendored KJV rather than bolls.life.
 * See src/lib/search.ts for why that mattered.
 */

// Simple in-memory rate limiter: max 60 requests per IP per 60 seconds.
// Higher than before now that a search is a local scan, not a proxied call.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count++;
  return entry.count > 60;
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

  const testamentParam = searchParams.get("testament");
  const testament =
    testamentParam === "OLD" || testamentParam === "NEW" ? testamentParam : undefined;

  const { results, total, truncated } = await searchScripture(query, {
    bookSlug: searchParams.get("book") || undefined,
    testament,
  });

  return NextResponse.json(
    { results, total, truncated },
    {
      headers: {
        // The KJV never changes, so a given query always has the same answer.
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
      },
    }
  );
}
