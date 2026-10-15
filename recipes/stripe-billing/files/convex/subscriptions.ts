import { query } from "./_generated/server";

/** Statuses Stripe considers "has access". `trialing` counts; `past_due` is your call. */
export const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * The signed-in user's subscription, shaped for the UI. Returns `null` when
 * signed out and `{ status: "none" }` for a user who never subscribed, so
 * components can render a single "upgrade" branch for both.
 */
export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const row = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();

    const status = row?.status ?? "none";
    return {
      status,
      isActive: ACTIVE_STATUSES.has(status),
      priceId: row?.priceId ?? null,
      currentPeriodEnd: row?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: row?.cancelAtPeriodEnd ?? false,
      hasCustomer: !!row,
    };
  },
});
