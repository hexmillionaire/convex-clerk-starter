# Vibe Stack

[![CI](https://github.com/hexmillionaire/convex-clerk-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/hexmillionaire/convex-clerk-starter/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black)
![Convex](https://img.shields.io/badge/Convex-realtime-orange)
![Clerk](https://img.shields.io/badge/Clerk-auth-6C47FF)

**A Next.js + Convex + Clerk starter for people who build with AI.**

Auth, realtime per-user data, dark mode, mobile nav, SEO, PWA and a deploy path — already wired, already tested in production. Clone it, run two commands, open Claude Code (or Cursor, or whatever you drive) and start on the idea instead of the plumbing.

> Built by someone who has shipped 10+ production apps since late 2024 without hand-writing code. This is the skeleton under one of them, extracted after it was live. The patterns in here survived real users.

---

## Quick start

Click **Use this template** at the top of the repo page to get your own copy with clean history, or clone:

```bash
git clone https://github.com/hexmillionaire/convex-clerk-starter my-app
cd my-app
npm install
npm run setup        # asks for your Clerk keys, writes .env.local
npx convex dev       # creates your Convex project, pushes the schema — leave running
npm run dev          # http://localhost:3000
```

You need a free [Clerk](https://clerk.com) account. Convex creates itself from the CLI. Both free tiers are more than enough to launch on.

One Clerk step the setup script walks you through: create a **JWT template named `convex`** (Clerk Dashboard → JWT Templates → New → pick Convex) and set its issuer on your Convex deployment:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-app.clerk.accounts.dev
```

Then sign in on `/dashboard`, add an item, open a second tab and watch it appear.

---

## What you get

| Area | What's wired | Where |
|---|---|---|
| **Auth** | Clerk, mounted only on routes that need it or when a session cookie exists. Public pages ship **zero** Clerk JS (~750KB saved). | `src/lib/auth.tsx`, `src/components/convex-provider.tsx` |
| **Data** | Convex with two tables showing the two shapes you'll ever need: many rows per user (`items`) and one row per user (`userSettings`). Every mutation checks ownership. | `convex/schema.ts`, `convex/items.ts`, `convex/userSettings.ts` |
| **Auth gate** | The 3-state loading → signed-out → connecting pattern every protected page uses. | `src/app/dashboard/page.tsx` |
| **UI** | shadcn/ui (15 components), Tailwind v4, light/dark/system, navbar + mobile tab bar sharing one nav config, skeleton/empty/error states. | `src/components/` |
| **SEO** | Metadata helper that can't drop OG images, dynamic OG route, sitemap, robots, canonical URLs. | `src/lib/metadata.ts`, `src/app/og/route.tsx` |
| **PWA** | Manifest + service worker (production only, so it never hides your dev edits). | `public/`, `src/components/sw-register.tsx` |
| **Security** | Headers (HSTS, nosniff, frame-deny, referrer policy, partial CSP), SEO-bot blocklist in middleware, CI fails on vulnerable production deps, Dependabot. See [SECURITY.md](SECURITY.md). | `next.config.ts`, `src/proxy.ts` |
| **Deploy** | Vercel-ready. Analytics included. | `vercel.json`-free: just connect the repo |
| **AI layer** | `CLAUDE.md` written for your agent, Convex's official skills, a workflow doc, and reusable task prompts. | `CLAUDE.md`, `.claude/skills/`, `docs/` |

---

## Stack

- [Next.js 16](https://nextjs.org) — App Router, Turbopack, React 19
- [Convex](https://convex.dev) — realtime database + serverless functions, typed end-to-end
- [Clerk](https://clerk.com) — auth, sessions, user management
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Base UI primitives)
- [Vercel](https://vercel.com) — hosting + analytics
- TypeScript throughout, ESLint

---

## Make it yours

1. **Rename.** `NEXT_PUBLIC_SITE_NAME` and `NEXT_PUBLIC_SITE_URL` in `.env.local`; `REPO_URL` in `src/lib/site.ts`; `public/manifest.json`.
2. **Logo.** Edit the SVG path in `src/components/logo.tsx` and regenerate `public/icons/*` (any 512px PNG + a 192px copy).
3. **Colors.** Tokens live in `src/app/globals.css` (`:root` and `.dark`). Paste a shadcn theme in and you're done.
4. **Your first feature.** Copy `convex/items.ts` → `convex/<thing>.ts`, add the table to `convex/schema.ts`, write a component like `items-panel.tsx`. If the route needs sign-in, add it to `AUTH_ROUTES` in `src/lib/auth.tsx`. Or just tell your agent: *"Add a `notes` table using the items pattern"* — `CLAUDE.md` tells it how.

### Deploy to Vercel

1. Push to GitHub, import the repo in Vercel.
2. Add env vars: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_URL` (your real domain), and `NEXT_PUBLIC_CONVEX_URL` (from `npx convex deploy`).
3. Set the build command to `npx convex deploy --cmd 'npm run build'` so Convex functions ship with each deploy.
4. In Clerk, switch to a production instance and update the JWT issuer on Convex prod: `npx convex env set CLERK_JWT_ISSUER_DOMAIN <prod issuer> --prod`.

---

## Recipes

Drop-in features that are too opinionated to ship on by default. Each one is a folder under `recipes/` with an `apply.mjs` that copies files in, patches the few anchor points, and prints what's left to do.

| Recipe | Adds | Apply |
|---|---|---|
| [**Stripe billing**](recipes/stripe-billing/) | Checkout, Customer Portal, webhook as a Convex HTTP action, `subscriptions` table, `useSubscription()`, `<Paywall>`, `/billing` page | `node recipes/stripe-billing/apply.mjs` |

Each apply script is idempotent and tells you by hand what to do if an anchor has moved. CI applies every recipe to a clean checkout and runs the full build on every push, so they can't silently rot. Want one that isn't here? [Request a recipe](https://github.com/hexmillionaire/convex-clerk-starter/issues/new?template=recipe.yml).

---

## Working with an AI agent

This repo assumes you'll build with Claude Code, Cursor, Codex or similar. To start, open the repo in your agent and say:

> Read CLAUDE.md, then add a `notes` table using the items pattern, with a protected `/notes` page.

Three things make that go well:

- **`CLAUDE.md`** explains the architecture and the two invariants that break the app if touched. Agents read it automatically. (`AGENTS.md` carries the same for other tools.)
- **`.claude/skills/`** has Convex's official skills for auth, migrations, components and performance, plus this repo's own: adding a per-user feature, running a QA pass, shipping a release.
- **`docs/WORKFLOW.md`** is the actual loop the original app was built with: plan in chat, execute in the agent, QA in the browser. Short, no theory.
- **`llms.txt`** is a one-page summary for agents that find this repo from the outside.

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Next dev server |
| `npm run dev:all` | Next + Convex dev together |
| `npm run setup` | Interactive `.env.local` writer |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

---

## Why these choices

**Why Convex over Supabase/Prisma?** No ORM, no migrations for additive changes, realtime by default, and the type of every query flows into React with zero codegen steps you run yourself. For a solo builder directing an agent it removes an entire category of bugs.

**Why Clerk over NextAuth?** Hosted UI, hosted user management, works in one afternoon. The conditional-mount trick in `src/lib/auth.tsx` removes its one real cost (bundle size on public pages).

**Why so small?** Every extra feature is one more thing your agent has to understand before it can help you. Two tables and four pages is enough to show every pattern; the rest is yours.

---

## Related

- [claude-md-generator](https://github.com/hexmillionaire/claude-md-generator) — `npx claude-md-generator` drafts a `CLAUDE.md` like this repo's for any project.
- [Agent Lanes](https://github.com/hexmillionaire/agent-lanes) — keep an agent's task inside its declared file scope, then hand it off.

## License

MIT. Use it for anything. A link back is appreciated, not required.
