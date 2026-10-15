# Security

Report vulnerabilities through GitHub's [private vulnerability reporting](https://github.com/hexmillionaire/convex-clerk-starter/security/advisories/new), not a public issue.

## What the starter does for you

- **Identity is server-side.** Every Convex function reads the user from `ctx.auth.getUserIdentity()`; none accept a `userId` argument. Every mutation on an existing row checks the caller owns it (`convex/items.ts`).
- **Secrets stay server-side.** Only `NEXT_PUBLIC_*` variables reach the browser. Clerk's secret key is read by Next on the server; Stripe keys (recipe) live on the Convex deployment, never in the Next bundle.
- **Headers** (`next.config.ts`): HSTS, `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy, a permissions policy that disables camera/mic/geolocation, and a partial CSP (`frame-ancestors 'none'; base-uri 'self'; object-src 'none'`).
- **Webhooks** (Stripe recipe) verify signatures against the raw body.
- **Dependencies:** CI fails if any production dependency has a known high or critical advisory. Dependabot opens weekly update PRs.

## What you still own

- **A full Content-Security-Policy.** The shipped policy is the subset that can't break Clerk, Convex or Vercel Analytics. A complete `script-src` / `connect-src` policy depends on your Clerk instance's domain (`*.clerk.accounts.dev` in development, `clerk.<yourdomain>` in production) and your Convex URL. Follow [Clerk's CSP guide](https://clerk.com/docs/security/clerk-csp) when you add one, and test sign-in, sign-out and OAuth popups after.
- **Rate limiting.** Convex mutations are open to any signed-in user as fast as they can call them. Add [`@convex-dev/rate-limiter`](https://www.convex.dev/components/rate-limiter) before anything costs you money per call.
- **Server-side checks for paid features.** `<Paywall>` is UI only; enforce in the Convex function.
- **Clerk production instance** with your own domain before launch; development instances show a banner and have relaxed limits.
