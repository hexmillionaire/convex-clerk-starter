import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getForChapter = query({
  args: {
    bookSlug: v.string(),
    chapter: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};
    const userId = identity.tokenIdentifier;

    const highlights = await ctx.db
      .query("highlights")
      .withIndex("by_user_chapter", (q) =>
        q
          .eq("userId", userId)
          .eq("bookSlug", args.bookSlug)
          .eq("chapter", args.chapter)
      )
      .collect();

    const map: Record<number, { color: string; note?: string }> = {};
    for (const h of highlights) {
      map[h.verseNumber] = { color: h.color, note: h.note };
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
    note: v.optional(v.string()),
    text: v.optional(v.string()),
    reference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    // Find existing highlight for this verse
    const match = await ctx.db
      .query("highlights")
      .withIndex("by_user_verse", (q) =>
        q
          .eq("userId", userId)
          .eq("bookSlug", args.bookSlug)
          .eq("chapter", args.chapter)
          .eq("verseNumber", args.verseNumber)
      )
      .first();

    if (match) {
      // Preserve existing note unless a new one is provided; backfill text/reference.
      await ctx.db.patch(match._id, {
        color: args.color,
        ...(args.note !== undefined ? { note: args.note } : {}),
        ...(args.text !== undefined ? { text: args.text } : {}),
        ...(args.reference !== undefined ? { reference: args.reference } : {}),
      });
      return match._id;
    }

    return await ctx.db.insert("highlights", {
      userId,
      bookSlug: args.bookSlug,
      chapter: args.chapter,
      verseNumber: args.verseNumber,
      color: args.color,
      note: args.note,
      text: args.text,
      reference: args.reference,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const match = await ctx.db
      .query("highlights")
      .withIndex("by_user_verse", (q) =>
        q
          .eq("userId", userId)
          .eq("bookSlug", args.bookSlug)
          .eq("chapter", args.chapter)
          .eq("verseNumber", args.verseNumber)
      )
      .first();

    if (match) {
      await ctx.db.delete(match._id);
    }
  },
});

export const updateNote = mutation({
  args: {
    bookSlug: v.string(),
    chapter: v.number(),
    verseNumber: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const match = await ctx.db
      .query("highlights")
      .withIndex("by_user_verse", (q) =>
        q
          .eq("userId", userId)
          .eq("bookSlug", args.bookSlug)
          .eq("chapter", args.chapter)
          .eq("verseNumber", args.verseNumber)
      )
      .first();

    if (match) {
      await ctx.db.patch(match._id, { note: args.note });
    }
  },
});
