import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const MILESTONE_THRESHOLDS: Record<string, number[]> = {
  chapters_read: [1, 10, 50, 100, 250, 500, 1000, 1189],
  streak: [3, 7, 14, 30, 60, 90, 180, 365],
  books_completed: [1, 5, 10, 20, 39, 66],
  bookmarks: [1, 10, 25, 50, 100, 250],
  journal_entries: [1, 5, 10, 25, 50, 100],
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;

    return await ctx.db
      .query("milestones")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const checkAndAward = mutation({
  args: {
    type: v.string(),
    currentValue: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const thresholds = MILESTONE_THRESHOLDS[args.type];
    if (!thresholds) return [];

    // Get existing milestones of this type
    const existing = await ctx.db
      .query("milestones")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", userId).eq("type", args.type)
      )
      .collect();

    const existingValues = new Set(existing.map((m) => m.value));
    const newMilestones: { type: string; value: number }[] = [];

    for (const threshold of thresholds) {
      if (args.currentValue >= threshold && !existingValues.has(threshold)) {
        await ctx.db.insert("milestones", {
          userId,
          type: args.type,
          value: threshold,
        });
        newMilestones.push({ type: args.type, value: threshold });
      }
    }

    return newMilestones;
  },
});

export const celebrate = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const milestone = await ctx.db.get(args.id);
    if (!milestone || milestone.userId !== userId) {
      throw new Error("Milestone not found");
    }

    await ctx.db.patch(args.id, { celebratedAt: Date.now() });
  },
});
