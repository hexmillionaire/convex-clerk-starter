import Stripe from "stripe";
import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Stripe subscriptions, Convex-native.
 *
 * Runs in Convex's default runtime: Stripe's SDK is given a fetch-based HTTP
 * client, so no `"use node"` and no cold-start penalty. The webhook lives in
 * `convex/http.ts`; this file holds the user-facing actions and the internal
 * functions the webhook calls.
 *
 * Env (set on the Convex deployment, not in .env.local):
 *   npx convex env set STRIPE_SECRET_KEY sk_test_…
 *   npx convex env set STRIPE_WEBHOOK_SECRET whsec_…
 *   npx convex env set STRIPE_PRICE_ID price_…
 *   npx convex env set SITE_URL http://localhost:3000
 */

export function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set on the Convex deployment");
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
}

function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Normalise a Stripe subscription into the row we store. */
export function rowFromSubscription(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  // `current_period_end` moved from the subscription to its items in newer
  // API versions; read whichever is present.
  const periodEnd =
    (item as { current_period_end?: number } | undefined)?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    null;
  return {
    stripeSubscriptionId: sub.id,
    status: sub.status,
    priceId: item?.price.id ?? null,
    currentPeriodEnd: periodEnd ? periodEnd * 1000 : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };
}

// ── Internal: called by actions and the webhook ─────────────────────────

export const getByUser = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getByCustomer = internalQuery({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, { stripeCustomerId }) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_customer", (q) => q.eq("stripeCustomerId", stripeCustomerId))
      .unique();
  },
});

export const setCustomer = internalMutation({
  args: { userId: v.string(), stripeCustomerId: v.string() },
  handler: async (ctx, { userId, stripeCustomerId }) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      if (existing.stripeCustomerId !== stripeCustomerId) await ctx.db.patch(existing._id, { stripeCustomerId });
      return existing._id;
    }
    return await ctx.db.insert("subscriptions", {
      userId,
      stripeCustomerId,
      stripeSubscriptionId: undefined,
      status: "none",
      priceId: undefined,
      currentPeriodEnd: undefined,
      cancelAtPeriodEnd: false,
    });
  },
});

export const upsertFromStripe = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    priceId: v.union(v.string(), v.null()),
    currentPeriodEnd: v.union(v.number(), v.null()),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("subscriptions")
      .withIndex("by_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .unique();
    if (!row) {
      // A subscription for a customer we never created. Happens if someone
      // subscribes via a Payment Link or the Stripe dashboard. Nothing to
      // attach it to until a user with that customer id signs in.
      console.warn("stripe: subscription for unknown customer", args.stripeCustomerId);
      return;
    }
    await ctx.db.patch(row._id, {
      stripeSubscriptionId: args.stripeSubscriptionId,
      status: args.status,
      priceId: args.priceId ?? undefined,
      currentPeriodEnd: args.currentPeriodEnd ?? undefined,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
    });
  },
});

// ── Public actions ──────────────────────────────────────────────────────

/**
 * Starts Stripe Checkout for the signed-in user and returns the URL to
 * redirect to. Creates the Stripe customer on first call so the webhook
 * can map events back to a user.
 */
export const createCheckoutSession = action({
  args: {},
  handler: async (ctx): Promise<{ url: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) throw new Error("STRIPE_PRICE_ID is not set on the Convex deployment");

    const stripe = stripeClient();
    const userId = identity.tokenIdentifier;

    let row = await ctx.runQuery(internal.stripe.getByUser, { userId });
    if (!row) {
      const customer = await stripe.customers.create({
        email: identity.email ?? undefined,
        name: identity.name ?? undefined,
        metadata: { userId },
      });
      await ctx.runMutation(internal.stripe.setCustomer, { userId, stripeCustomerId: customer.id });
      row = await ctx.runQuery(internal.stripe.getByUser, { userId });
    }
    if (!row) throw new Error("Could not create customer");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: row.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl()}/billing?checkout=success`,
      cancel_url: `${siteUrl()}/billing?checkout=cancelled`,
      allow_promotion_codes: true,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  },
});

/** Opens the Stripe Customer Portal (cancel, change card, invoices). */
export const createPortalSession = action({
  args: {},
  handler: async (ctx): Promise<{ url: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const row = await ctx.runQuery(internal.stripe.getByUser, { userId: identity.tokenIdentifier });
    if (!row) throw new Error("No billing account yet");

    const session = await stripeClient().billingPortal.sessions.create({
      customer: row.stripeCustomerId,
      return_url: `${siteUrl()}/billing`,
    });
    return { url: session.url };
  },
});
