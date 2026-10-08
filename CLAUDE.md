@AGENTS.md

# Vibe Stack — agent notes

Next.js 16 (App Router) + Convex + Clerk + Tailwind v4 + shadcn/ui. Small on
purpose: two Convex tables, four routes. Read this whole file before changing
anything; it is short.

## Two invariants that are easy to break

**The root provider must render on the server.** `ConvexClientProvider` in
`src/app/layout.tsx` wraps the navbar, `main` and the footer. If it is ever
declared with `dynamic(..., { ssr: false })`, every page ships an empty
`<body>` with its content stranded in the flight payload — invisible to
crawlers and to anyone with slow JS. Don't do it, even to fix a hydration
warning. Fix the hydration warning.

**Import `useUser` and `useClerk` from `@/lib/auth`, never from
`@clerk/nextjs`.** Clerk mounts only on routes in `AUTH_ROUTES`
(`src/lib/auth.tsx`) or when its `__client_uat` cookie is present, so public
pages don't pay for the sign-in bundle. Clerk's own hooks throw outside a
`ClerkProvider`, and a hook call can't be made conditional. The one exception
is `src/app/login/page.tsx`, which uses `SignInButton`/`SignUpButton` from
`@clerk/nextjs` because `/login` is always an auth route.

Corollary: **every route that requires a signed-in user goes in `AUTH_ROUTES`.**
Forgetting this doesn't break returning users (the cookie mounts Clerk) but a
first-time visitor to that route sees the signed-out tree.

## Where things go

| Need | Do |
|---|---|
| A new per-user collection | Copy `convex/items.ts`, rename, adjust fields. Add the table to `convex/schema.ts` with a `by_user` index. Convex regenerates `_generated/` when `npx convex dev` is running — never hand-edit those files. |
| A per-user setting | Add the field to `userSettings` in `schema.ts` and to the `update` mutation's args in `convex/userSettings.ts`. The client applies defaults; `get` returns `null` until first save. |
| A protected page | Copy the gate from `src/app/dashboard/page.tsx` (loading → signed-out → connecting → content). Add the route to `AUTH_ROUTES`. Give it a `layout.tsx` with `socialMetadata({ noIndex: true })`. |
| A public page | `page.tsx` with `export const metadata = socialMetadata({...})`. Add it to `src/app/sitemap.ts`. |
| A nav link | `NAV_LINKS` in `src/components/navbar.tsx`. The mobile tab bar reads the same array. |
| Site name / URL / repo link | `.env.local` (`NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_URL`) and `src/lib/site.ts`. Nothing else hardcodes them. |
| Colors | `:root` and `.dark` in `src/app/globals.css`. shadcn token names. |
| A UI primitive | `npx shadcn@latest add <name>`. Style is `base-nova` (Base UI, not Radix) — components use `render={...}` instead of `asChild`. |

## Convex rules

- Read `convex/_generated/ai/guidelines.md` before writing Convex code; it
  overrides training data.
- Identity comes from `ctx.auth.getUserIdentity()` inside the function. Never
  accept `userId` as an argument.
- Queries return `[]`/`null` for signed-out callers so public pages can call
  them. Mutations throw.
- Read through indexes (`withIndex("by_user", …)`). `.filter()` is for
  narrowing an indexed result, not for scanning a table.
- Client components call `useQuery(api.x.y, isAuthenticated ? {} : "skip")`
  when the result is per-user and the page can render before auth settles.
- `undefined` from `useQuery` means loading; render a skeleton, not an empty
  state.

## Metadata

Go through `socialMetadata()` in `src/lib/metadata.ts`. Setting `openGraph`
directly on a page replaces (not merges) the parent's object and drops the
image, so shared links render as blank cards.

## Service worker

Registered in production only (`src/components/sw-register.tsx`). If you see
stale content after a deploy, bump `CACHE_NAME` in `public/sw.js`. To remove
PWA support: delete that file, `public/sw.js`, `public/manifest.json`, and
their two references in `layout.tsx`.

## Checks before you say "done"

```bash
npm run typecheck && npm run lint && npm run build
```

Build needs `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
set (placeholders are fine for a build check). Then open the page in a
browser; `tsc` passing is not the same as the page working.

## Convex

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks are installed under `.claude/skills/` and `.agents/skills/`. Refresh them with `npx convex ai-files install`.
