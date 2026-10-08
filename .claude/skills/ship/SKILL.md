---
name: ship
description: Pre-deploy checklist and deploy steps for this app on Vercel with Convex and Clerk production instances. Use when the user says "deploy", "ship it", "push to prod", "go live", or asks how to set up production.
---

# Ship

## Before the first production deploy

Do these once per project.

**Convex production deployment**

```bash
npx convex deploy          # creates the prod deployment, prints its URL
```

**Clerk production instance**

1. Clerk Dashboard → switch to Production. Add your domain; follow its DNS
   instructions.
2. JWT Templates → confirm the `convex` template exists in production too
   (templates don't copy over). Copy its Issuer URL.
3. Set it on Convex prod:
   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://clerk.yourdomain.com --prod
   ```

**Vercel project**

Import the repo. Environment variables (Production):

| Var | From |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | output of `npx convex deploy` |
| `CONVEX_DEPLOY_KEY` | Convex Dashboard → Settings → Deploy key (lets Vercel push functions) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk production `pk_live_…` |
| `CLERK_SECRET_KEY` | Clerk production `sk_live_…` |
| `NEXT_PUBLIC_SITE_NAME` | your app name |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` (no trailing slash) |

Build command: `npx convex deploy --cmd 'npm run build'` so schema and
functions ship with every deploy and can't drift from the frontend.

## Every deploy

1. `npm run typecheck && npm run lint && npm run build` locally.
2. Run the `qa-pass` skill, at least tiers 1–3.
3. If `public/sw.js` precache list changed, bump `CACHE_NAME`.
4. Commit with a message that says what changed for a user, not which files.
5. Push. Watch the Vercel build log and the Convex dashboard's function log
   for the first minute.
6. Open the production URL signed out, then signed in. Confirm one write
   round-trips.

## Rollback

Vercel → Deployments → previous → Promote to Production. Convex functions
are versioned with the deploy; if the schema changed additively nothing else
is needed. If you removed a field, re-add it as optional before rolling back.

## Report

Production URL, the Convex deployment name, and anything that needed a
manual step the next person should know about.
