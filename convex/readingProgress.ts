import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getForBook = query({
  args: { bookSlug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};
    const userId = identity.tokenIdentifier;

    const progress = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", userId).eq("bookSlug", args.bookSlug)
      )
      .collect();

    const map: Record<number, boolean> = {};
    for (const p of progress) {
      map[p.chapter] = true;
    }
    return map;
  },
});

export const getAllProgress = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;

    return await ctx.db
      .query("readingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const markRead = mutation({
  args: {
    bookSlug: v.string(),
    chapter: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    // Check if already marked
    const match = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_book_chapter", (q) =>
        q.eq("userId", userId).eq("bookSlug", args.bookSlug).eq("chapter", args.chapter)
      )
      .first();

    if (match) return match._id;

    const id = await ctx.db.insert("readingProgress", {
      userId,
      bookSlug: args.bookSlug,
      chapter: args.chapter,
    });

    // Auto-trigger milestone checks after marking a chapter read
    const allProgress = await ctx.db
      .query("readingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const chaptersRead = allProgress.length;
    const booksCompleted = new Set<string>();

    // Import bible book chapter counts inline to avoid circular deps
    const BOOK_CHAPTERS: Record<string, number> = {
      genesis: 50, exodus: 40, leviticus: 27, numbers: 36, deuteronomy: 34,
      joshua: 24, judges: 21, ruth: 4, "1-samuel": 31, "2-samuel": 24,
      "1-kings": 22, "2-kings": 25, "1-chronicles": 29, "2-chronicles": 36,
      ezra: 10, nehemiah: 13, esther: 10, job: 42, psalms: 150, proverbs: 31,
      ecclesiastes: 12, "song-of-solomon": 8, isaiah: 66, jeremiah: 52,
      lamentations: 5, ezekiel: 48, daniel: 12, hosea: 14, joel: 3, amos: 9,
      obadiah: 1, jonah: 4, micah: 7, nahum: 3, habakkuk: 3, zephaniah: 3,
      haggai: 2, zechariah: 14, malachi: 4, matthew: 28, mark: 16, luke: 24,
      john: 21, acts: 28, romans: 16, "1-corinthians": 16, "2-corinthians": 13,
      galatians: 6, ephesians: 6, philippians: 4, colossians: 4,
      "1-thessalonians": 5, "2-thessalonians": 3, "1-timothy": 6, "2-timothy": 4,
      titus: 3, philemon: 1, hebrews: 13, james: 5, "1-peter": 5, "2-peter": 3,
      "1-john": 5, "2-john": 1, "3-john": 1, jude: 1, revelation: 22,
    };

    // Count completed books
    const bookChaptersRead: Record<string, Set<number>> = {};
    for (const p of allProgress) {
      if (!bookChaptersRead[p.bookSlug]) bookChaptersRead[p.bookSlug] = new Set();
      bookChaptersRead[p.bookSlug].add(p.chapter);
    }
    for (const [slug, chapters] of Object.entries(bookChaptersRead)) {
      if (BOOK_CHAPTERS[slug] && chapters.size >= BOOK_CHAPTERS[slug]) {
        booksCompleted.add(slug);
      }
    }

    // Calculate streak for milestone check
    const readDates = [...new Set(
      allProgress.map((p) => {
        const d = new Date(p._creationTime);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
    )].sort().reverse();

    let streak = 0;
    const today = new Date();
    if (readDates.length > 0) {
      const d = new Date(today);
      for (const dateStr of readDates) {
        const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (dateStr === expected) { streak++; d.setDate(d.getDate() - 1); }
        else if (dateStr < expected) break;
      }
    }

    // Fire milestone checks
    await ctx.runMutation(api.milestones.checkAndAward, { type: "chapters_read", currentValue: chaptersRead });
    await ctx.runMutation(api.milestones.checkAndAward, { type: "streak", currentValue: streak });
    await ctx.runMutation(api.milestones.checkAndAward, { type: "books_completed", currentValue: booksCompleted.size });

    return id;
  },
});

export const markUnread = mutation({
  args: {
    bookSlug: v.string(),
    chapter: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const match = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_book_chapter", (q) =>
        q.eq("userId", userId).eq("bookSlug", args.bookSlug).eq("chapter", args.chapter)
      )
      .first();

    if (match) {
      await ctx.db.delete(match._id);
    }
  },
});
