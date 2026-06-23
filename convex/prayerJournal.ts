import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;

    return await ctx.db
      .query("prayerJournal")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    request: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    return await ctx.db.insert("prayerJournal", {
      userId,
      request: args.request,
      category: args.category,
      answered: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("prayerJournal"),
    request: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const prayer = await ctx.db.get(args.id);
    if (!prayer || prayer.userId !== userId) {
      throw new Error("Prayer not found");
    }

    await ctx.db.patch(args.id, {
      ...(args.request !== undefined ? { request: args.request } : {}),
      ...(args.category !== undefined ? { category: args.category } : {}),
    });
  },
});

export const markAnswered = mutation({
  args: {
    id: v.id("prayerJournal"),
    answeredNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const prayer = await ctx.db.get(args.id);
    if (!prayer || prayer.userId !== userId) {
      throw new Error("Prayer not found");
    }

    await ctx.db.patch(args.id, {
      answered: true,
      answeredNote: args.answeredNote,
      answeredAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("prayerJournal") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const prayer = await ctx.db.get(args.id);
    if (!prayer || prayer.userId !== userId) {
      throw new Error("Prayer not found");
    }

    await ctx.db.delete(args.id);
  },
});
