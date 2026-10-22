import { query, mutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * The "many rows per user" pattern. Copy this file to add any per-user
 * collection: rename the table, change the fields, keep the shape.
 *
 * Three rules every function here follows:
 *   1. Identity comes from `ctx.auth`, never from arguments.
 *   2. Reads go through the `by_user` index.
 *   3. Writes to an existing row check ownership first.
 */

/**
 * Server-side length limits. The form's `maxLength` is a courtesy; any
 * client can call these mutations directly, so the handler is the real gate.
 */
export const TITLE_MAX = 200;
export const NOTE_MAX = 2000;

function limit(value: string, max: number, label: string): string {
  if (value.length > max) throw new Error(`${label} must be ${max} characters or fewer`);
  return value;
}

/** Resolves the caller's user id, or null when signed out. */
async function currentUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.tokenIdentifier ?? null;
}

/** Same, but throws — for mutations, where "signed out" is an error. */
async function requireUserId(ctx: MutationCtx): Promise<string> {
  const userId = await currentUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    // Signed-out callers get an empty list rather than an error, so public
    // pages can call this unconditionally.
    if (!userId) return [];

    return await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = limit(args.title.trim(), TITLE_MAX, "Title");
    if (!title) throw new Error("Title is required");
    const note = args.note === undefined ? undefined : limit(args.note.trim(), NOTE_MAX, "Note") || undefined;

    return await ctx.db.insert("items", {
      userId,
      title,
      note,
      completed: false,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Item not found");

    await ctx.db.patch(args.id, { completed: !item.completed });
  },
});

export const update = mutation({
  args: {
    id: v.id("items"),
    title: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Item not found");

    const patch: { title?: string; note?: string } = {};
    if (args.title !== undefined) {
      const title = limit(args.title.trim(), TITLE_MAX, "Title");
      if (!title) throw new Error("Title is required");
      patch.title = title;
    }
    if (args.note !== undefined) patch.note = limit(args.note.trim(), NOTE_MAX, "Note") || undefined;

    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Item not found");

    await ctx.db.delete(args.id);
  },
});

export const clearCompleted = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const done = await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();

    await Promise.all(done.map((item) => ctx.db.delete(item._id)));
    return done.length;
  },
});
