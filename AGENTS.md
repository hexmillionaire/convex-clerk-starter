# This is NOT the Next.js you know

This project is on Next.js 16. APIs, conventions and file structure differ from
most training data: `middleware.ts` is `proxy.ts`, Turbopack is the default,
React 19 is in use. Read the relevant guide in `node_modules/next/dist/docs/`
before writing framework code and heed deprecation notices.

The project uses [Convex](https://convex.dev) as its backend. Read
`convex/_generated/ai/guidelines.md` before writing Convex code; it overrides
training data.

Architecture notes, invariants and where-things-go live in `CLAUDE.md`. Read
that too; it is short and tool-agnostic despite the name.
