import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;

    return await ctx.db
      .query("journal")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    passage: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    return await ctx.db.insert("journal", {
      userId,
      title: args.title,
      passage: args.passage,
      content: args.content,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("journal"),
    title: v.optional(v.string()),
    passage: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== userId) {
      throw new Error("Entry not found");
    }

    const updates: Record<string, string> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.passage !== undefined) updates.passage = args.passage;
    if (args.content !== undefined) updates.content = args.content;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("journal") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== userId) {
      throw new Error("Entry not found");
    }

    await ctx.db.delete(args.id);
  },
});
