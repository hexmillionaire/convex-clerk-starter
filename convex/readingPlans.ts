import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserPlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;

    return await ctx.db
      .query("userReadingPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const startPlan = mutation({
  args: { planSlug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    // Check if already started
    const existing = await ctx.db
      .query("userReadingPlans")
      .withIndex("by_user_plan", (q) =>
        q.eq("userId", userId).eq("planSlug", args.planSlug)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("userReadingPlans", {
      userId,
      planSlug: args.planSlug,
      currentDay: 1,
      startedAt: Date.now(),
    });
  },
});

export const advanceDay = mutation({
  args: { planSlug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const plan = await ctx.db
      .query("userReadingPlans")
      .withIndex("by_user_plan", (q) =>
        q.eq("userId", userId).eq("planSlug", args.planSlug)
      )
      .first();

    if (!plan) throw new Error("Plan not started");

    await ctx.db.patch(plan._id, { currentDay: plan.currentDay + 1 });
  },
});

export const resetPlan = mutation({
  args: { planSlug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const plan = await ctx.db
      .query("userReadingPlans")
      .withIndex("by_user_plan", (q) =>
        q.eq("userId", userId).eq("planSlug", args.planSlug)
      )
      .first();

    if (plan) {
      await ctx.db.delete(plan._id);
    }
  },
});
