import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.tokenIdentifier;

    return await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const update = mutation({
  args: {
    dailyGoal: v.optional(v.number()),
    reminderEnabled: v.optional(v.boolean()),
    reminderTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      const patch: Record<string, unknown> = {};
      if (args.dailyGoal !== undefined) patch.dailyGoal = args.dailyGoal;
      if (args.reminderEnabled !== undefined) patch.reminderEnabled = args.reminderEnabled;
      if (args.reminderTime !== undefined) patch.reminderTime = args.reminderTime;
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("userSettings", {
      userId,
      dailyGoal: args.dailyGoal ?? 1,
      reminderEnabled: args.reminderEnabled,
      reminderTime: args.reminderTime,
    });
  },
});
