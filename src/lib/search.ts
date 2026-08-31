/**
 * Full-text search over the vendored KJV.
 *
 * This used to proxy bolls.life, which caused the worst bug on the site:
 * bolls returns book ids outside 1-66 (Tobit is 67, Sirach 71), those had no
 * entry in our book map, and they rendered as "Unknown" linking to
 * `/bible//29/20` — an empty slug straight to a 404. Searching "love thy
 * neighbour" put four of those dead links above every canonical result, with
 * Matthew 22:39 at rank fourteen.
 *
 * Searching the local text fixes that at the root: only the 66 books exist
 * here. It also lifts bolls' own 40-result cap and lets results be ranked by
 * how well they actually match.
 */

import { BIBLE_BOOKS } from "@/lib/bible-data";
import { getBook } from "@/lib/kjv";

export type SearchHit = {
  bookName: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  text: string;
};

export const MAX_RESULTS = 400;

/** Ranked above each other in this order. */
const SCORE_PHRASE = 3; // the whole query, as typed, appears in the verse
const SCORE_ALL_TERMS = 2; // every term appears, in any order
const SCORE_SOME_TERMS = 1; // at least one term (single-term queries only)

/**
 * A lowercase mirror of the whole Bible, built once per process on first
 * search. ~4MB, and it saves lowercasing 31,102 strings on every query.
 */
let lowerCache: Map<string, string[][]> | null = null;

async function getLowercased(slug: string): Promise<string[][] | null> {
  lowerCache ??= new Map();
  const cached = lowerCache.get(slug);
  if (cached) return cached;

  const book = await getBook(slug);
  if (!book) return null;

  const lowered = book.map((chapter) => chapter.map((verse) => verse.toLowerCase()));
  lowerCache.set(slug, lowered);
  return lowered;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Word-prefix match, so "love" finds "loved", "loveth" and "lovest" — bolls
 * stemmed for us and a plain substring search would not. Deliberately does not
 * match mid-word, so "art" doesn't hit "heart" or "depart".
 */
function hasTermAsWordPrefix(haystack: string, term: string): boolean {
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(term, from);
    if (at === -1) return false;
    const before = at === 0 ? " " : haystack[at - 1];
    if (!/[a-z0-9']/.test(before)) return true; // sits at a word boundary
    from = at + 1;
  }
}

export type SearchOptions = {
  /** Restrict to one book slug. */
  bookSlug?: string;
  /** Restrict to one testament. */
  testament?: "OLD" | "NEW";
};

export async function searchScripture(
  rawQuery: string,
  options: SearchOptions = {}
): Promise<{ results: SearchHit[]; total: number; truncated: boolean }> {
  const phrase = normalize(rawQuery);
  if (phrase.length < 2) return { results: [], total: 0, truncated: false };

  const terms = [...new Set(phrase.split(" ").filter(Boolean))];
  const singleTerm = terms.length === 1;

  const books = BIBLE_BOOKS.filter((book) => {
    if (options.bookSlug && book.slug !== options.bookSlug) return false;
    if (options.testament && book.testament !== options.testament) return false;
    return true;
  });

  // Scored buckets, filled in canonical order so ties keep scripture's order.
  const buckets: SearchHit[][] = [[], [], [], []];
  let total = 0;

  for (const book of books) {
    const lowered = await getLowercased(book.slug);
    const original = await getBook(book.slug);
    if (!lowered || !original) continue;

    for (let c = 0; c < lowered.length; c++) {
      const chapter = lowered[c];
      for (let v = 0; v < chapter.length; v++) {
        const haystack = chapter[v];

        let score = 0;
        if (haystack.includes(phrase)) {
          score = SCORE_PHRASE;
        } else {
          let matched = 0;
          for (const term of terms) {
            if (hasTermAsWordPrefix(haystack, term)) matched++;
          }
          if (matched === terms.length) score = SCORE_ALL_TERMS;
          else if (matched > 0 && singleTerm) score = SCORE_SOME_TERMS;
        }
        if (score === 0) continue;

        total++;
        if (total <= MAX_RESULTS * 2) {
          buckets[score].push({
            bookName: book.name,
            bookSlug: book.slug,
            chapter: c + 1,
            verse: v + 1,
            text: original[c][v],
          });
        }
      }
    }
  }

  const results = [...buckets[3], ...buckets[2], ...buckets[1]].slice(0, MAX_RESULTS);
  return { results, total, truncated: total > results.length };
}
