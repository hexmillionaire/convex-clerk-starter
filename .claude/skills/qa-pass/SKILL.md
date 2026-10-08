---
name: qa-pass
description: Runs a structured QA pass on this app — static checks, then a route-by-route walk signed out and signed in, at desktop and mobile widths, with the dev server log watched. Use when the user says "QA", "test it", "check everything", "before I ship", or after a batch of changes.
---

# QA pass

The goal is to find what `tsc` can't. Work top-down; stop and fix at the
first failure in each tier before moving on, unless the user says to collect
everything first.

## Tier 1 — static (2 minutes)

```bash
npm run typecheck && npm run lint
```

Then `npm run build` with the real `.env.local`. A build that passes locally
and fails on Vercel is almost always a missing env var; list every
`process.env.*` the code reads and confirm each is set.

## Tier 2 — routes, signed out

Start `npm run dev` (and `npx convex dev`) and keep both logs visible. Visit:

| Route | Expect |
|---|---|
| `/` | Renders fully in view-source (no empty `<body>`). No Clerk script in the network tab. |
| `/about` | Same. |
| `/dashboard` | Sign-in prompt, not a spinner, not a redirect. |
| `/login` | Clerk buttons render. |
| `/nope` | The 404 page with site chrome. |
| `/og` | A 1200×630 image. |
| `/sitemap.xml`, `/robots.txt` | Valid, correct domain. |

Console must be clean on every route. Hydration warnings are failures.

## Tier 3 — routes, signed in

Sign in, then:

- `/dashboard`: add, toggle, delete an item; change a setting. Open a second
  tab and confirm each change appears there without a reload.
- Reload `/dashboard`: content appears, no flash of the signed-out state.
- Sign out from the navbar: lands on `/`, `/dashboard` now shows the prompt.
- Sign back in via `/login`: redirects to `/dashboard`.

## Tier 4 — mobile

Resize to 375px wide (or use a phone on the LAN URL):

- Bottom tab bar visible, correct active state on each route.
- Nothing hidden under the tab bar at the end of any page.
- Navbar collapses: logo only, theme toggle, no account dropdown.
- Tap targets on the items list are usable; delete is visible without hover.

## Tier 5 — theme

Toggle light/dark/system. Check text contrast on cards, muted text and the
primary button in both. Reload in dark: no white flash.

## Report

List only failures, each as: route → what happened → likely file. If
nothing failed, say so in one line and name the tiers that ran.
