import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * The "one row per user" pattern — a settings/profile singleton.
 *
 * `get` returns null until the user saves something; the client applies
 * defaults. `update` upserts: patch the row if it exists, insert it otherwise.
 * Only fields the caller passed are written, so partial updates are safe.
 */

/** Server-side limit; the form's `maxLength` alone is bypassable. */
export const NICKNAME_MAX = 40;

export const DEFAULT_SETTINGS = {
  nickname: undefined as string | undefined,
  showCompleted: true,
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();
  },
});

export const update = mutation({
  args: {
    nickname: v.optional(v.string()),
    showCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const nickname = args.nickname === undefined ? undefined : args.nickname.trim() || undefined;
    if (nickname !== undefined && nickname.length > NICKNAME_MAX) {
      throw new Error(`Nickname must be ${NICKNAME_MAX} characters or fewer`);
    }

    if (existing) {
      const patch: { nickname?: string; showCompleted?: boolean } = {};
      if (args.nickname !== undefined) patch.nickname = nickname;
      if (args.showCompleted !== undefined) patch.showCompleted = args.showCompleted;
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("userSettings", {
      userId,
      nickname,
      showCompleted: args.showCompleted ?? DEFAULT_SETTINGS.showCompleted,
    });
  },
});
