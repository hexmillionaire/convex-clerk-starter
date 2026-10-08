---
name: add-per-user-feature
description: Adds a new per-user data feature to this app end to end — Convex table, functions, protected page, nav link — by copying the items pattern. Use when the user asks to add any kind of per-user collection (notes, tasks, bookmarks, orders, logs) or a new signed-in page, even phrased as "add a X table" or "I want users to be able to save Y."
---

# Add a per-user feature

Every per-user feature in this app has the same four pieces. Build them in
this order so each step is checkable before the next.

## 0. Read first

- `CLAUDE.md` (the two invariants)
- `convex/schema.ts`, `convex/items.ts` — the pattern you're copying
- `src/components/items-panel.tsx`, `src/app/dashboard/page.tsx` — client side

Confirm `npx convex dev` is running; it regenerates `convex/_generated/` on
every schema change. Never edit generated files by hand.

## 1. Schema

In `convex/schema.ts`, add the table. Always:

```ts
things: defineTable({
  userId: v.string(),
  // …fields
}).index("by_user", ["userId"]),
```

Add a compound index only when a query needs it (e.g. `["userId", "status"]`).
Save; watch the convex dev terminal accept the schema.

## 2. Functions

Copy `convex/items.ts` to `convex/<things>.ts`. Keep the helpers
(`currentUserId`, `requireUserId`). Rules:

- Identity from `ctx.auth`, never from args.
- Queries return `[]`/`null` when signed out; mutations throw.
- Every mutation on an existing row loads it and checks `row.userId === userId`.
- Trim strings; reject empty required fields with a clear error.

Check: `npm run typecheck` passes and the convex terminal shows the new
functions.

## 3. Page + component

- Component in `src/components/<things>-panel.tsx`, modelled on
  `items-panel.tsx`: `useQuery` → skeleton on `undefined`, empty state on `[]`,
  list otherwise; `useMutation` for writes.
- Route at `src/app/<things>/page.tsx` using the exact gate from
  `src/app/dashboard/page.tsx` (loading → signed-out → connecting → content).
- `src/app/<things>/layout.tsx` with `socialMetadata({ ..., noIndex: true })`.
- **Add the route to `AUTH_ROUTES` in `src/lib/auth.tsx`.** Skipping this is
  the most common mistake.
- Add to `disallow` in `src/app/robots.ts`.

## 4. Nav

Add an entry to `NAV_LINKS` in `src/components/navbar.tsx`. The mobile tab
bar picks it up automatically. Keep it to four or five links total; fold
extras into the account dropdown.

## Done when

- `npm run typecheck && npm run lint` pass.
- Signed out: the route shows the sign-in prompt, no console errors.
- Signed in: create, edit, delete work; a second tab updates live.
- Mobile width: the tab bar shows the new link and nothing is hidden under it.

Report what you built in four lines: table, functions, route, nav. No recap
of the steps.
