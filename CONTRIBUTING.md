# Contributing

Small and opinionated on purpose. The best contributions:

- **Bug fixes** in the starter itself.
- **New recipes** — a feature too opinionated to ship on by default (file uploads, email, AI chat, rate limiting…). See below.
- **Better agent docs** — anything an agent got wrong in this repo is a missing line in `CLAUDE.md`.

Not wanted: new default features. Every extra table or page is one more thing a fork has to delete.

## Setup

```bash
npm install
npm run setup     # Clerk keys → .env.local
npx convex dev    # leave running
npm run dev
```

## Before opening a PR

```bash
npm run typecheck && npm run lint && npm run build
```

CI runs the same, plus every recipe applied to a clean checkout. Read [CLAUDE.md](CLAUDE.md) — the two invariants there are the ones that break the app silently.

## Adding a recipe

1. `recipes/<name>/files/` mirroring repo paths for new files.
2. `recipes/<name>/apply.mjs` — copy `stripe-billing/apply.mjs`; it's generic. Patches find an exact anchor string and print a manual step if it's moved. Must be idempotent.
3. `recipes/<name>/README.md` — what it adds (table), setup, how the pieces talk, how to remove it.
4. Add `<name>` to the `recipe` matrix in `.github/workflows/ci.yml`.
5. Add a row to the Recipes table in the root README.
