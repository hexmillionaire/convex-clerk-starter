import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

    return await ctx.db.insert("readingProgress", {
      userId,
      bookSlug: args.bookSlug,
      chapter: args.chapter,
    });
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
