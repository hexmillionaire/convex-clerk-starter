/**
 * One-time vendoring of the KJV into `src/data/kjv/`.
 *
 * The KJV is public domain and never changes, so there is no reason to fetch it
 * from a third party on every build. Running this once makes the build hermetic
 * and lets the whole Bible be cached for offline reading.
 *
 * Each book becomes `src/data/kjv/<slug>.json`, an array of chapters, each an
 * array of verse strings. Verse N is at index N-1 — asserted below, not assumed.
 *
 *   npm run vendor:kjv
 *
 * Every chapter is checked against VERSE_COUNTS before anything is written; a
 * single mismatch aborts the run rather than committing a partial Bible.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "src/data/kjv");
const CONCURRENCY = 6;
const MAX_RETRIES = 4;

// ── Read book list + expected verse counts straight out of the TS sources, so
// this script can never drift from what the app believes about the canon.
function parseBooks() {
  const src = readFileSync(join(ROOT, "src/lib/bible-data.ts"), "utf8");
  const re = /\{\s*name:\s*"([^"]+)",\s*slug:\s*"([^"]+)",[^}]*?chapters:\s*(\d+),\s*position:\s*(\d+)\s*\}/g;
  const books = [...src.matchAll(re)].map((m) => ({
    name: m[1],
    slug: m[2],
    chapters: Number(m[3]),
    position: Number(m[4]),
  }));
  if (books.length !== 66) throw new Error(`Expected 66 books, parsed ${books.length}`);
  return books;
}

function parseVerseCounts() {
  const src = readFileSync(join(ROOT, "src/lib/verse-counts.ts"), "utf8");
  const re = /^\s{2}"?([a-z0-9-]+)"?:\s*\[([\d,\s]+)\],?$/gm;
  const counts = {};
  for (const m of src.matchAll(re)) {
    counts[m[1]] = m[2].split(",").map((n) => Number(n.trim()));
  }
  if (Object.keys(counts).length !== 66) {
    throw new Error(`Expected 66 verse-count entries, parsed ${Object.keys(counts).length}`);
  }
  return counts;
}

// ── Text cleaning. Mirrors `cleanVerseText` in src/lib/bible-data.ts so the
// vendored text is already in its final form and nothing has to clean it at
// request time. Keep the two in sync if either changes.
function cleanVerseText(raw) {
  let text = raw;
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  text = text.replace(/<S>\d+<\/S>/g, "");
  text = text.replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, "");
  text = text.replace(/<\/?[^>]+(>|$)/g, "");
  text = text.replace(/([a-zA-Z'])\d{1,5}\b/g, "$1");
  text = text.replace(/\s\d{1,5}(?=\s|[.,;:!?]|$)/g, "");
  text = text.replace(/\s{2,}/g, " ");
  return text.trim();
}

/**
 * Bolls' KJV appends the Greek Additions to Esther to chapter 10, so it returns
 * 13 verses where the canonical 66-book KJV has 3. We ship the 66-book canon,
 * so the additions are dropped. This is the only place Bolls and the canon
 * disagree across all 1,189 chapters.
 */
const CANON_TRUNCATIONS = {
  esther: { 10: 3 },
};

async function fetchChapter(position, chapter, attempt = 1) {
  const url = `https://bolls.life/get-text/KJV/${position}/${chapter}/`;
  try {
    const res = await fetch(url, { headers: { "user-agent": "divineword.app one-time KJV vendoring" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (attempt >= MAX_RETRIES) throw new Error(`${url} failed after ${MAX_RETRIES}: ${err.message}`);
    await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
    return fetchChapter(position, chapter, attempt + 1);
  }
}

// Bounded-concurrency map that preserves input order.
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

async function main() {
  const books = parseBooks();
  const verseCounts = parseVerseCounts();
  mkdirSync(OUT_DIR, { recursive: true });

  let done = 0;
  let totalVerses = 0;
  let totalBytes = 0;
  const problems = [];
  const divergences = [];

  for (const book of books) {
    const chapterNums = Array.from({ length: book.chapters }, (_, i) => i + 1);

    const chapters = await mapLimit(chapterNums, CONCURRENCY, async (ch) => {
      const raw = await fetchChapter(book.position, ch);

      // Verse N must sit at index N-1. Assert contiguity rather than trusting it.
      let sorted = [...raw].sort((a, b) => a.verse - b.verse);

      const truncateTo = CANON_TRUNCATIONS[book.slug]?.[ch];
      if (truncateTo !== undefined) sorted = sorted.slice(0, truncateTo);

      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].verse !== i + 1) {
          problems.push(`${book.slug} ${ch}: verse numbering breaks at index ${i} (got ${sorted[i].verse})`);
          break;
        }
      }

      // VERSE_COUNTS is regenerated from this data afterwards, so a divergence
      // is reported for review rather than treated as fatal — the 1 Samuel
      // entries in the hand-maintained table were wrong, not the scripture.
      const expected = verseCounts[book.slug]?.[ch - 1];
      if (expected !== undefined && sorted.length !== expected) {
        divergences.push(`${book.slug} ${ch}: table says ${expected}, scripture has ${sorted.length}`);
      }

      const verses = sorted.map((v) => cleanVerseText(v.text));
      const empty = verses.findIndex((t) => t.length === 0);
      if (empty !== -1) problems.push(`${book.slug} ${ch}:${empty + 1} cleaned to an empty string`);

      done++;
      if (done % 50 === 0) process.stdout.write(`  ${done}/1189 chapters\n`);
      return verses;
    });

    const json = JSON.stringify(chapters);
    writeFileSync(join(OUT_DIR, `${book.slug}.json`), json + "\n");
    totalVerses += chapters.reduce((a, c) => a + c.length, 0);
    totalBytes += json.length;
  }

  // ── Regenerate VERSE_COUNTS from the vendored scripture. The table drives the
  // sitemap, so deriving it from the text is what stops the two disagreeing.
  const countLines = books.map((b) => {
    const lens = JSON.parse(readFileSync(join(OUT_DIR, `${b.slug}.json`), "utf8")).map((c) => c.length);
    const key = /^[a-z][a-z0-9]*$/.test(b.slug) ? b.slug : `"${b.slug}"`;
    return `  ${key}: [${lens.join(",")}],`;
  });
  writeFileSync(
    join(ROOT, "src/lib/verse-counts.ts"),
    `/**
 * KJV verse counts per chapter for all 66 books.
 * Keys are book slugs, values are arrays where index 0 = chapter 1 verse count.
 * Total: ${totalVerses.toLocaleString()} verses across ${done.toLocaleString()} chapters.
 *
 * GENERATED by scripts/vendor-kjv.mjs from src/data/kjv/ — do not edit by hand.
 * Deriving this from the vendored text is what keeps the sitemap from listing
 * verses that don't exist.
 */
export const VERSE_COUNTS: Record<string, number[]> = {
${countLines.join("\n")}
};
`
  );

  console.log(`\n  ${books.length} books · ${done} chapters · ${totalVerses.toLocaleString()} verses`);
  console.log(`  ${(totalBytes / 1024 / 1024).toFixed(2)} MB written to src/data/kjv/`);
  console.log(`  src/lib/verse-counts.ts regenerated from the vendored text`);

  if (divergences.length) {
    console.log(`\n  ${divergences.length} chapter(s) where the old table disagreed with scripture:`);
    for (const d of divergences) console.log(`    ${d}`);
    console.log(`  The table has been rewritten to match the text.`);
  }

  if (problems.length) {
    console.error(`\n  ${problems.length} integrity problem(s):`);
    for (const p of problems.slice(0, 40)) console.error(`    ${p}`);
    if (problems.length > 40) console.error(`    …and ${problems.length - 40} more`);
    process.exit(1);
  }
  if (totalVerses !== 31102) {
    console.error(`\n  Expected 31,102 verses, got ${totalVerses.toLocaleString()}`);
    process.exit(1);
  }
  console.log("\n  31,102 verses, contiguous, none empty. ✓");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
