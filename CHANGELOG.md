# Changelog

## 2026-10-15

- **Security:** upgraded Next.js 16.2.1 → 16.4.1, Clerk 7.0 → 7.9, Convex 1.34 → 1.46 and patched transitive packages: production dependencies went from 35 known advisories (4 critical) to 0. `shadcn` moved to devDependencies (it's a CLI; its remaining advisories have no upstream fix and never reach the browser).
- **Security:** partial CSP (`frame-ancestors`, `base-uri`, `object-src`) and `Cross-Origin-Opener-Policy`.
- **Fix:** settings panel no longer copies server state into local state in an effect (could clobber typing and re-rendered twice); error page navigates with `<Link>`.
- **Recipe:** Stripe billing — Checkout, Customer Portal, Convex HTTP-action webhook, `useSubscription()`, `<Paywall>`, `/billing`.
- **CI:** typecheck, lint, build, production audit, and every recipe applied to a clean checkout and built. Actions pinned to SHAs.
- **Docs:** `llms.txt`, SECURITY.md, CONTRIBUTING.md, issue and PR templates, Dependabot.

## 2026-10-08

First release: extracted from a production Next.js + Convex + Clerk app.
