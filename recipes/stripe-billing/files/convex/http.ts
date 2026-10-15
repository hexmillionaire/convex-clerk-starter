import Stripe from "stripe";
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { rowFromSubscription, stripeClient } from "./stripe";

/**
 * Stripe webhook.
 *
 * Lives at  https://<deployment>.convex.site/stripe/webhook  (note: .site,
 * not .cloud). Register that URL in Stripe → Developers → Webhooks with
 * these events:
 *
 *   checkout.session.completed
 *   customer.subscription.created
 *   customer.subscription.updated
 *   customer.subscription.deleted
 *
 * Signature verification needs the raw body. `req.text()` gives it to us
 * untouched; never `req.json()` first.
 */
const http = httpRouter();

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return new Response("STRIPE_WEBHOOK_SECRET not set", { status: 500 });

    const signature = req.headers.get("stripe-signature");
    if (!signature) return new Response("Missing signature", { status: 400 });

    const body = await req.text();
    let event: Stripe.Event;
    try {
      event = await stripeClient().webhooks.constructEventAsync(
        body,
        signature,
        secret,
        undefined,
        Stripe.createSubtleCryptoProvider()
      );
    } catch (err) {
      console.error("stripe: bad signature", (err as Error).message);
      return new Response("Bad signature", { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription && session.customer) {
          const sub = await stripeClient().subscriptions.retrieve(
            typeof session.subscription === "string" ? session.subscription : session.subscription.id
          );
          await ctx.runMutation(internal.stripe.upsertFromStripe, {
            stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer.id,
            ...rowFromSubscription(sub),
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await ctx.runMutation(internal.stripe.upsertFromStripe, {
          stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          ...rowFromSubscription(sub),
        });
        break;
      }
      default:
        // Unhandled event types are fine; Stripe only sends what you subscribe to.
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
