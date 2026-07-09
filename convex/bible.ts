import { query, action } from "./_generated/server";
import { v } from "convex/values";
import { cleanVerseText, normalizeTranslation } from "./lib/clean";

// Get all verses for a specific chapter
export const getChapter = query({
  args: {
    bookSlug: v.string(),
    chapter: v.number(),
    translation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const translation = args.translation ?? "KJV";
    const verses = await ctx.db
      .query("verses")
      .withIndex("by_chapter", (q) =>
        q
          .eq("bookSlug", args.bookSlug)
          .eq("chapter", args.chapter)
          .eq("translation", translation)
      )
      .collect();

    return verses.sort((a, b) => a.verseNumber - b.verseNumber);
  },
});

// Search verses by text
export const searchVerses = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.query.length < 2) return [];

    const results = await ctx.db
      .query("verses")
      .withSearchIndex("search_text", (q) => q.search("text", args.query))
      .take(50);

    return results;
  },
});

// Check if we have seeded data for a translation
export const hasData = query({
  args: { translation: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const translation = args.translation ?? "KJV";
    const sample = await ctx.db
      .query("verses")
      .withIndex("by_translation", (q) => q.eq("translation", translation))
      .first();
    return sample !== null;
  },
});

// Fetch chapter from external API (used when DB has no data)
export const fetchChapterFromAPI = action({
  args: {
    bookSlug: v.string(),
    bookId: v.number(),
    chapter: v.number(),
    translation: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const translation = normalizeTranslation(args.translation);

    const res = await fetch(
      `https://bolls.life/get-text/${translation}/${args.bookId}/${args.chapter}/`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch verses from external API");
    }

    const data: { pk: number; verse: number; text: string }[] =
      await res.json();

    return data.map((v) => ({
      verse: v.verse,
      text: cleanVerseText(v.text),
    }));
  },
});
