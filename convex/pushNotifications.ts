import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getAllSubscriptions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const subs = await ctx.db.query("pushSubscriptions").collect();
    return subs.map((s) => ({
      _id: s._id as string,
      endpoint: s.endpoint,
      keys: s.keys,
    }));
  },
});

export const removeStale = internalMutation({
  args: {
    ids: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      try {
        await ctx.db.delete(id as Id<"pushSubscriptions">);
      } catch {
        // Already deleted
      }
    }
  },
});
