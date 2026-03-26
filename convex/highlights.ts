import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getForChapter = query({
  args: {
    bookSlug: v.string(),
    chapter: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

    const highlights = await ctx.db
      .query("highlights")
      .withIndex("by_user_chapter", (q) =>
        q
          .eq("userId", userId)
          .eq("bookSlug", args.bookSlug)
          .eq("chapter", args.chapter)
      )
      .collect();

    const map: Record<number, string> = {};
    for (const h of highlights) {
      map[h.verseNumber] = h.color;
    }
    return map;
  },
});

export const set = mutation({
  args: {
    bookSlug: v.string(),
    chapter: v.number(),
    verseNumber: v.number(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find existing highlight for this verse
    const existing = await ctx.db
      .query("highlights")
      .withIndex("by_user_chapter", (q) =>
        q
          .eq("userId", userId)
          .eq("bookSlug", args.bookSlug)
          .eq("chapter", args.chapter)
      )
      .collect();

    const match = existing.find((h) => h.verseNumber === args.verseNumber);

    if (match) {
      await ctx.db.patch(match._id, { color: args.color });
      return match._id;
    }

    return await ctx.db.insert("highlights", {
      userId,
      bookSlug: args.bookSlug,
      chapter: args.chapter,
      verseNumber: args.verseNumber,
      color: args.color,
    });
  },
});

export const remove = mutation({
  args: {
    bookSlug: v.string(),
    chapter: v.number(),
    verseNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const highlights = await ctx.db
      .query("highlights")
      .withIndex("by_user_chapter", (q) =>
        q
          .eq("userId", userId)
          .eq("bookSlug", args.bookSlug)
          .eq("chapter", args.chapter)
      )
      .collect();

    const match = highlights.find((h) => h.verseNumber === args.verseNumber);
    if (match) {
      await ctx.db.delete(match._id);
    }
  },
});
