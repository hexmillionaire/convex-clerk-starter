import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getForBook = query({
  args: { bookSlug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

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
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already marked
    const existing = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", userId).eq("bookSlug", args.bookSlug)
      )
      .collect();

    const match = existing.find((p) => p.chapter === args.chapter);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", userId).eq("bookSlug", args.bookSlug)
      )
      .collect();

    const match = existing.find((p) => p.chapter === args.chapter);
    if (match) {
      await ctx.db.delete(match._id);
    }
  },
});
