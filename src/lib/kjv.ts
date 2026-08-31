/**
 * Server-side access to the vendored KJV in `src/data/kjv/`.
 *
 * The KJV is public domain and immutable, so it ships with the app rather than
 * being fetched from bolls.life at request or build time. That makes chapter
 * pages statically generatable, keeps the build hermetic, and is what lets the
 * whole Bible be cached for offline reading.
 *
 * Only WEB and ASV still go over the network — see `fetchRemoteChapter`.
 *
 * This module must not reach the client: the 66 JSON files total ~4MB. It is
 * imported only by server components and route handlers.
 */

import {
  BIBLE_BOOKS,
  cleanVerseText,
  TRANSLATIONS,
  DEFAULT_TRANSLATION,
  type BookInfo,
  type Translation,
} from "@/lib/bible-data";

export type Verse = { verse: number; text: string };

export function normalizeTranslation(value: string | null | undefined): Translation {
  const upper = (value ?? "").toUpperCase();
  return (TRANSLATIONS as readonly string[]).includes(upper)
    ? (upper as Translation)
    : DEFAULT_TRANSLATION;
}

const VALID_SLUGS = new Set(BIBLE_BOOKS.map((b) => b.slug));

// Each book is loaded once per server process and kept. Whole-Bible worst case
// is ~4MB resident, which is cheaper than re-parsing on every render.
const bookCache = new Map<string, string[][]>();

/**
 * Every chapter of a book, as arrays of verse strings (verse N at index N-1).
 * Returns null for an unknown slug.
 */
export async function getBook(slug: string): Promise<string[][] | null> {
  if (!VALID_SLUGS.has(slug)) return null;

  const cached = bookCache.get(slug);
  if (cached) return cached;

  // The slug is validated above, so this only ever resolves to a file the
  // bundler has already included from src/data/kjv/.
  const mod = (await import(`@/data/kjv/${slug}.json`)) as { default: string[][] };
  bookCache.set(slug, mod.default);
  return mod.default;
}

/**
 * Verses for one chapter of the vendored KJV. Returns null for an unknown book
 * or an out-of-range chapter, so callers can `notFound()` on it.
 */
export async function getChapter(slug: string, chapter: number): Promise<Verse[] | null> {
  const book = await getBook(slug);
  if (!book) return null;
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.length) return null;

  return book[chapter - 1].map((text, i) => ({ verse: i + 1, text }));
}

/** A single verse, or null if the book, chapter, or verse doesn't exist. */
export async function getVerse(
  slug: string,
  chapter: number,
  verse: number
): Promise<string | null> {
  const book = await getBook(slug);
  if (!book) return null;
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.length) return null;

  const verses = book[chapter - 1];
  if (!Number.isInteger(verse) || verse < 1 || verse > verses.length) return null;
  return verses[verse - 1];
}

/** Number of verses in a chapter, or 0 if it doesn't exist. */
export async function getVerseCount(slug: string, chapter: number): Promise<number> {
  const book = await getBook(slug);
  if (!book || chapter < 1 || chapter > book.length) return 0;
  return book[chapter - 1].length;
}

/**
 * WEB and ASV are still fetched from bolls.life. They're the minority path, and
 * a stale or failed fetch there degrades to an empty chapter rather than
 * breaking the build — unlike the KJV, which every static page depends on.
 */
export async function fetchRemoteChapter(
  book: BookInfo,
  chapter: number,
  translation: Translation
): Promise<Verse[]> {
  try {
    const res = await fetch(
      `https://bolls.life/get-text/${translation}/${book.position}/${chapter}/`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return [];
    const data: { verse: number; text: string }[] = await res.json();
    return data
      .sort((a, b) => a.verse - b.verse)
      .map((v) => ({ verse: v.verse, text: cleanVerseText(v.text) }));
  } catch {
    return [];
  }
}

/**
 * Chapter text in any supported translation. KJV is served from disk; the rest
 * go over the network.
 */
export async function getChapterInTranslation(
  book: BookInfo,
  chapter: number,
  translation: Translation
): Promise<Verse[]> {
  if (translation === "KJV") {
    return (await getChapter(book.slug, chapter)) ?? [];
  }
  return fetchRemoteChapter(book, chapter, translation);
}
