# Changelog

## Unreleased

- **Security:** `items.add`/`items.update` and `userSettings.update` enforce the form limits server-side (title 200, note 2000, nickname 40 characters). The client `maxLength` alone was bypassable by calling the mutations directly.
- **Security:** the proxy matcher is Clerk's recommended form and now includes `/(api|trpc)(.*)`, so the first `/api` route a fork adds runs through `clerkMiddleware` instead of having `auth()` throw or run unauthenticated.
- **Recipe:** Stripe billing — `createCheckoutSession` rejects a user whose subscription is already `active` or `trialing`, so a repeated Upgrade click cannot create a second subscription; changes go through the Customer Portal.
- **Security:** `/og` share-card route hard-caps `title`/`subtitle` at the intended length and rejects query values over 500 characters with a 400. Previously a space-free value of any length skipped truncation and was rasterised in full on every request.

## 2026-10-15

- **Security:** upgraded Next.js 16.2.1 → 16.4.1, Clerk 7.0 → 7.9, Convex 1.34 → 1.46 and patched transitive packages: production dependencies went from 35 known advisories (4 critical) to 0. `shadcn` moved to devDependencies (it's a CLI; its remaining advisories have no upstream fix and never reach the browser).
- **Security:** partial CSP (`frame-ancestors`, `base-uri`, `object-src`) and `Cross-Origin-Opener-Policy`.
- **Fix:** settings panel no longer copies server state into local state in an effect (could clobber typing and re-rendered twice); error page navigates with `<Link>`.
- **Recipe:** Stripe billing — Checkout, Customer Portal, Convex HTTP-action webhook, `useSubscription()`, `<Paywall>`, `/billing`.
- **CI:** typecheck, lint, build, production audit, and every recipe applied to a clean checkout and built. Actions pinned to SHAs.
- **Docs:** `llms.txt`, SECURITY.md, CONTRIBUTING.md, issue and PR templates, Dependabot.

## 2026-10-08

First release: extracted from a production Next.js + Convex + Clerk app.
