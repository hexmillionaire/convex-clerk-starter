@AGENTS.md

## Scripture is vendored, not fetched

The KJV lives in `src/data/kjv/` — one JSON file per book, an array of
chapters, each an array of verse strings (verse N at index N-1). ~4MB, public
domain, immutable. **Do not reintroduce a runtime or build-time fetch for KJV
text.** It is what makes chapter pages statically generatable and the whole
Bible cacheable for offline reading.

- Read it through `src/lib/kjv.ts` (`getChapter`, `getVerse`, `getBook`).
  That module is server-only; never import it into a client component.
- WEB and ASV are still fetched from bolls.life, via
  `getChapterInTranslation`. They are the minority path and a failed fetch
  there degrades to an empty chapter rather than breaking the build.
- Search (`src/lib/search.ts`) scans the local text. It previously proxied
  bolls, which returns book ids outside 1-66 (Tobit is 67, Sirach 71) that
  rendered as "Unknown" linking to `/bible//29/20`.

Regenerate with `npm run vendor:kjv`. The script validates every chapter and
rewrites `src/lib/verse-counts.ts` from the result, so the sitemap can never
list verses that don't exist. Two things it handles that are easy to get wrong:

- `VERSE_COUNTS` was hand-maintained and wrong for 1 Samuel 20-31, putting 70
  URLs that 404 into the sitemap. It is generated now — don't hand-edit it.
- bolls appends the Greek Additions to Esther to chapter 10, returning 13
  verses where the 66-book canon has 3. See `CANON_TRUNCATIONS`.

Totals must reconcile to 31,102 verses across 1,189 chapters; the script exits
non-zero otherwise.

## Two invariants that are easy to break

**The root provider must render on the server.** `ConvexClientProvider` wraps
the navbar, `main` and the footer. It was once declared with
`dynamic(..., { ssr: false })`, which meant every page on the site shipped an
empty `<body>` with its content stranded in the flight payload. Don't put it
back.

**Import `useUser` and `useClerk` from `@/lib/auth`, not `@clerk/nextjs`.**
Clerk only mounts on auth-dependent routes or when its `__client_uat` cookie is
present, so public pages don't pay for the sign-in bundle. Clerk's own hooks
throw outside a `ClerkProvider`, and a hook call can't be made conditional.


<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
