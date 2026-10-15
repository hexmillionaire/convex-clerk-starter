# Recipe: Stripe billing

Subscriptions with Stripe Checkout, a Convex-native webhook, a realtime
`useSubscription()` hook, a `<Paywall>` component and a `/billing` page.
One plan; add more by adding prices.

```bash
node recipes/stripe-billing/apply.mjs
```

Takes about ten minutes end to end, most of it clicking in the Stripe dashboard.

## What it adds

| File | Role |
|---|---|
| `convex/stripe.ts` | `createCheckoutSession` and `createPortalSession` actions; internal functions the webhook uses |
| `convex/http.ts` | The webhook at `/stripe/webhook`, verified with the raw body |
| `convex/subscriptions.ts` | `getMine` query, shaped for the UI |
| `convex/schema.ts` *(patched)* | `subscriptions` table, one row per customer |
| `src/lib/use-subscription.ts` | `useSubscription()` — realtime, flips the moment the webhook lands |
| `src/components/paywall.tsx` | `<Paywall>…</Paywall>` — children for subscribers, upgrade prompt for everyone else |
| `src/app/billing/` | Plan status, Upgrade, Manage billing (Stripe Customer Portal) |
| `src/lib/auth.tsx`, `navbar.tsx`, `robots.ts` *(patched)* | `/billing` is an auth route, in the account menu, not indexed |

No client-side Stripe SDK. Checkout and the portal are hosted redirects, so the
browser bundle doesn't grow and there's no publishable key to manage.

## Setup

**1. Stripe product.** Dashboard → Products → Add product → recurring price.
Copy the `price_…` id.

**2. Convex env.** These go on the deployment, not in `.env.local`:

```bash
npx convex env set STRIPE_SECRET_KEY sk_test_…
npx convex env set STRIPE_PRICE_ID price_…
npx convex env set SITE_URL http://localhost:3000
```

**3. Webhook.** The endpoint is on your Convex **`.site`** domain, not `.cloud`:

```
https://<deployment-name>.convex.site/stripe/webhook
```

For local dev, use the Stripe CLI:

```bash
stripe listen --forward-to https://<deployment-name>.convex.site/stripe/webhook
npx convex env set STRIPE_WEBHOOK_SECRET whsec_…    # printed by `stripe listen`
```

For production, add the endpoint in Dashboard → Developers → Webhooks with
these events, and set the signing secret on the prod deployment with `--prod`:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**4. Run.** `npx convex dev` picks up the new functions. Open `/billing`,
click Upgrade, pay with `4242 4242 4242 4242`. The page flips to Pro without
a reload when the webhook arrives.

## Using it

Gate UI:

```tsx
import { Paywall } from "@/components/paywall";

<Paywall>
  <ExportButton />
</Paywall>
```

Read state anywhere:

```tsx
const { isActive, isLoading, status } = useSubscription();
```

**Enforce on the server too.** `<Paywall>` is a UI nicety. Anything that
costs you money or must not leak goes behind a check in the Convex function:

```ts
const sub = await ctx.db
  .query("subscriptions")
  .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
  .unique();
if (!sub || !["active", "trialing"].includes(sub.status)) throw new Error("Pro required");
```

## How the pieces talk

```
/billing  ─click Upgrade─▶  createCheckoutSession (action)
                                │  creates Stripe customer on first call,
                                │  stores customer id in `subscriptions`
                                ▼
                         Stripe Checkout (hosted)
                                │ pays
                                ▼
          Stripe ──POST──▶ /stripe/webhook (http action, .convex.site)
                                │  verifies signature on raw body
                                ▼
                     upsertFromStripe (internal mutation)
                                │
                                ▼
              `subscriptions` row updated → useSubscription() re-renders
```

## Multiple plans

Add prices in Stripe, pass `priceId` as an argument to `createCheckoutSession`
(add it to `args` with `v.string()`), and branch on `sub.priceId` in the UI.
The webhook and table need no changes.

## Removing it

Delete the files in the table above, remove the `subscriptions` table from
the schema, revert the three patches, `npm uninstall stripe`. The apply
script is idempotent, so re-running it later restores everything.

## Why these choices

- **Checkout + Portal, not Elements.** Hosted pages are PCI-scoped to Stripe,
  handle SCA/3DS, tax, coupons and card updates, and look fine. Elements is
  for when you need the form inside your own page, which a starter doesn't.
- **Webhook as a Convex HTTP action.** It runs next to the data it writes,
  with no extra service, and `constructEventAsync` with the SubtleCrypto
  provider works in Convex's default runtime — no `"use node"`.
- **Status mirrored, not derived.** The table stores what Stripe says. "Is
  this user Pro?" is one indexed read, and the rules live in one place
  (`ACTIVE_STATUSES`).
