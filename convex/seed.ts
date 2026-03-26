import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Internal mutation to batch-insert verses
export const insertVerses = internalMutation({
  args: {
    verses: v.array(
      v.object({
        bookId: v.number(),
        bookName: v.string(),
        bookSlug: v.string(),
        chapter: v.number(),
        verseNumber: v.number(),
        text: v.string(),
        translation: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const verse of args.verses) {
      await ctx.db.insert("verses", verse);
    }
  },
});

// Seed a single book from the Bolls.life API
export const seedBook = action({
  args: {
    bookId: v.number(),
    bookName: v.string(),
    bookSlug: v.string(),
    totalChapters: v.number(),
    translation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const translation = args.translation ?? "KJV";

    for (let chapter = 1; chapter <= args.totalChapters; chapter++) {
      const res = await fetch(
        `https://bolls.life/get-text/${translation}/${args.bookId}/${chapter}/`
      );

      if (!res.ok) {
        console.error(
          `Failed to fetch ${args.bookName} ${chapter}: ${res.status}`
        );
        continue;
      }

      const data: { verse: number; text: string }[] = await res.json();

      const verses = data.map((v) => ({
        bookId: args.bookId,
        bookName: args.bookName,
        bookSlug: args.bookSlug,
        chapter,
        verseNumber: v.verse,
        text: v.text
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim(),
        translation,
      }));

      // Insert in batches (Convex limits mutation size)
      const BATCH_SIZE = 100;
      for (let i = 0; i < verses.length; i += BATCH_SIZE) {
        const batch = verses.slice(i, i + BATCH_SIZE);
        await ctx.runMutation(internal.seed.insertVerses, { verses: batch });
      }

      console.log(
        `Seeded ${args.bookName} ${chapter} (${data.length} verses)`
      );
    }
  },
});
