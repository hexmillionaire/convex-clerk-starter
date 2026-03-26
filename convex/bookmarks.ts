import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    bookSlug: v.string(),
    chapter: v.number(),
    verseNumber: v.number(),
    reference: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already bookmarked
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_verse", (q) =>
        q
          .eq("userId", userId)
          .eq("bookSlug", args.bookSlug)
          .eq("chapter", args.chapter)
          .eq("verseNumber", args.verseNumber)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("bookmarks", {
      userId,
      ...args,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("bookmarks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const bookmark = await ctx.db.get(args.id);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("Bookmark not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const isBookmarked = query({
  args: {
    bookSlug: v.string(),
    chapter: v.number(),
    verseNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_verse", (q) =>
        q
          .eq("userId", userId)
          .eq("bookSlug", args.bookSlug)
          .eq("chapter", args.chapter)
          .eq("verseNumber", args.verseNumber)
      )
      .first();

    return existing !== null;
  },
});
