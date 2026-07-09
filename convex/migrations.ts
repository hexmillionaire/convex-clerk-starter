/**
 * One-time migration: clean translator-footnote pollution from legacy bookmarks
 * and highlights.
 *
 * Background: an earlier version of `cleanVerseText` converted KJV `<sup>` marginal
 * notes into inline parentheticals (e.g. "...still waters(still: Heb. waters of
 * quietness)") and saved that into bookmark/highlight `text`. The current cleaner
 * drops footnotes entirely, but already-saved rows keep the old text. Re-cleaning
 * the stored string can't recover the original (the tags are gone), so this
 * migration re-fetches each affected chapter from Bolls and re-cleans the verse.
 *
 * It also backfills `text`/`reference` on legacy highlights that never stored them
 * (so they render with verse text on the dashboard like new highlights do).
 *
 * Safe to re-run (idempotent). Defaults to a dry run.
 *
 *   npx convex run migrations:cleanLegacyFootnotes '{"dryRun": true}'   # preview
 *   npx convex run migrations:cleanLegacyFootnotes '{"dryRun": false}'  # apply
 */
import { internalQuery, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { cleanVerseText } from "./lib/clean";
import { BOOKS } from "./lib/books";

type CollectedRows = {
  bookmarks: {
    id: Id<"bookmarks">;
    bookSlug: string;
    chapter: number;
    verseNumber: number;
    text: string;
  }[];
  highlights: {
    id: Id<"highlights">;
    bookSlug: string;
    chapter: number;
    verseNumber: number;
    text?: string;
    reference?: string;
  }[];
};

export const collectRows = internalQuery({
  args: {},
  handler: async (ctx): Promise<CollectedRows> => {
    const bookmarks = await ctx.db.query("bookmarks").take(5000);
    const highlights = await ctx.db.query("highlights").take(5000);
    return {
      bookmarks: bookmarks.map((b) => ({
        id: b._id,
        bookSlug: b.bookSlug,
        chapter: b.chapter,
        verseNumber: b.verseNumber,
        text: b.text,
      })),
      highlights: highlights.map((h) => ({
        id: h._id,
        bookSlug: h.bookSlug,
        chapter: h.chapter,
        verseNumber: h.verseNumber,
        text: h.text,
        reference: h.reference,
      })),
    };
  },
});

export const applyPatches = internalMutation({
  args: {
    bookmarkPatches: v.array(v.object({ id: v.id("bookmarks"), text: v.string() })),
    highlightPatches: v.array(
      v.object({
        id: v.id("highlights"),
        text: v.string(),
        reference: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const p of args.bookmarkPatches) {
      await ctx.db.patch(p.id, { text: p.text });
    }
    for (const p of args.highlightPatches) {
      await ctx.db.patch(p.id, {
        text: p.text,
        ...(p.reference !== undefined ? { reference: p.reference } : {}),
      });
    }
  },
});

export const cleanLegacyFootnotes = internalAction({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;
    const rows: CollectedRows = await ctx.runQuery(internal.migrations.collectRows, {});

    // Fetch each distinct (book, chapter) once and build verse -> clean text.
    const chapterKeys = new Set<string>();
    for (const b of rows.bookmarks) chapterKeys.add(`${b.bookSlug}/${b.chapter}`);
    for (const h of rows.highlights) chapterKeys.add(`${h.bookSlug}/${h.chapter}`);

    const verseText = new Map<string, Map<number, string>>();
    let fetchFailures = 0;
    for (const key of chapterKeys) {
      const slashIdx = key.lastIndexOf("/");
      const slug = key.slice(0, slashIdx);
      const chapter = key.slice(slashIdx + 1);
      const book = BOOKS[slug];
      if (!book) continue;
      try {
        const res = await fetch(
          `https://bolls.life/get-text/KJV/${book.position}/${chapter}/`
        );
        if (!res.ok) {
          fetchFailures++;
          continue;
        }
        const data: { verse: number; text: string }[] = await res.json();
        const m = new Map<number, string>();
        for (const item of data) m.set(item.verse, cleanVerseText(item.text));
        verseText.set(key, m);
      } catch {
        fetchFailures++;
      }
    }

    const bookmarkPatches: { id: Id<"bookmarks">; text: string }[] = [];
    const samples: { ref: string; before: string; after: string }[] = [];
    for (const b of rows.bookmarks) {
      const clean = verseText.get(`${b.bookSlug}/${b.chapter}`)?.get(b.verseNumber);
      if (clean && clean !== b.text) {
        bookmarkPatches.push({ id: b.id, text: clean });
        if (samples.length < 6) {
          samples.push({
            ref: `${b.bookSlug} ${b.chapter}:${b.verseNumber}`,
            before: b.text,
            after: clean,
          });
        }
      }
    }

    const highlightPatches: { id: Id<"highlights">; text: string; reference?: string }[] = [];
    for (const h of rows.highlights) {
      const clean = verseText.get(`${h.bookSlug}/${h.chapter}`)?.get(h.verseNumber);
      if (!clean) continue;
      const book = BOOKS[h.bookSlug];
      const ref = book ? `${book.name} ${h.chapter}:${h.verseNumber}` : undefined;
      const needsText = h.text === undefined || h.text !== clean;
      const needsRef = h.reference === undefined && ref !== undefined;
      if (needsText || needsRef) {
        highlightPatches.push({
          id: h.id,
          text: clean,
          ...(needsRef ? { reference: ref } : {}),
        });
      }
    }

    if (dryRun) {
      return {
        dryRun: true,
        scannedBookmarks: rows.bookmarks.length,
        scannedHighlights: rows.highlights.length,
        chaptersFetched: verseText.size,
        fetchFailures,
        bookmarksToChange: bookmarkPatches.length,
        highlightsToChange: highlightPatches.length,
        samples,
      };
    }

    const BATCH = 50;
    for (let i = 0; i < bookmarkPatches.length; i += BATCH) {
      await ctx.runMutation(internal.migrations.applyPatches, {
        bookmarkPatches: bookmarkPatches.slice(i, i + BATCH),
        highlightPatches: [],
      });
    }
    for (let i = 0; i < highlightPatches.length; i += BATCH) {
      await ctx.runMutation(internal.migrations.applyPatches, {
        bookmarkPatches: [],
        highlightPatches: highlightPatches.slice(i, i + BATCH),
      });
    }

    return {
      dryRun: false,
      scannedBookmarks: rows.bookmarks.length,
      scannedHighlights: rows.highlights.length,
      chaptersFetched: verseText.size,
      fetchFailures,
      bookmarksChanged: bookmarkPatches.length,
      highlightsChanged: highlightPatches.length,
    };
  },
});
