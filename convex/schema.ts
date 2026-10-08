import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Two tables, two patterns. Every per-user feature you'll ever build is one
 * of these shapes:
 *
 *   items        — many rows per user  (todos, notes, bookmarks, orders…)
 *   userSettings — one row per user    (preferences, profile, onboarding state)
 *
 * `userId` is Clerk's `tokenIdentifier`, read server-side from
 * `ctx.auth.getUserIdentity()`. Never accept it as a function argument — a
 * client could pass someone else's.
 *
 * Every table a user owns gets a `by_user` index. Queries filter through the
 * index, never with `.filter()` over the whole table.
 */
export default defineSchema({
  items: defineTable({
    userId: v.string(),
    title: v.string(),
    note: v.optional(v.string()),
    completed: v.boolean(),
  }).index("by_user", ["userId"]),

  userSettings: defineTable({
    userId: v.string(),
    nickname: v.optional(v.string()),
    showCompleted: v.boolean(),
  }).index("by_user", ["userId"]),
});
