# How this was built (and how to build on it)

The app this starter came from was built in under a year by one person who
does not hand-write code. This is the loop that worked. It is not a
methodology; it is what survived contact with real users.

## The loop

```
  plan in chat  →  execute in the agent  →  QA in the browser  →  repeat
  (claude.ai)      (Claude Code)             (you, by hand)
```

**Plan in chat.** Describe the feature to a chat model with the repo open or
pasted context. Ask it to argue with you: what's the smallest version, what
will break, what does the schema need. Leave with a brief, not code. A good
brief fits in one screen and names the files it touches.

**Execute in the agent.** Paste the brief into Claude Code (or Cursor, Codex,
etc.) inside the repo. Let it read `CLAUDE.md` first. Let it run the dev
server and read the logs. Your job is to answer its questions and say "no,
smaller" when it over-builds.

**QA in the browser.** Open the page. Click everything. Open it on your phone.
`tsc` passing means the types agree with each other, not that the feature
works. The dev server log scrolling beside the browser catches the most.

## Writing briefs that work

A brief has four parts. Skip one and the agent fills it in with a guess.

1. **Outcome** — one sentence a user would say. "I can pin an item to the top."
2. **Touches** — the files or layers involved. "Schema, items.ts, items-panel."
3. **Constraints** — what *not* to do. "No new dependencies. Don't change the gate."
4. **Done when** — how you'll check. "Pinned item stays on top after reload and in a second tab."

Example brief for this repo:

> Add a `notes` table using the items pattern. Each note has `title` and
> `body`. Protected route `/notes` with the dashboard gate, listed in the nav.
> No rich text, no sharing. Done when I can create, edit, delete a note and
> see it update live in a second tab.

That brief is about eight minutes of agent time on this starter.

## Habits that saved the most time

- **Make the agent read before it writes.** "Read `convex/items.ts` and
  `CLAUDE.md`, then propose the change" beats "add a notes table" every time.
- **One feature per session.** Context fills up; quality drops. Commit,
  start fresh.
- **Ask for the plan first on anything touching auth or schema.** Those are
  the two places a confident wrong guess costs you an afternoon.
- **Keep `CLAUDE.md` current.** Every time the agent breaks an invariant,
  that invariant gets a paragraph. The file in this repo is the result of
  exactly that.
- **Let it see errors directly.** Paste the terminal, or better, have it run
  the command. Describing an error to an agent is a game of telephone.
- **Say "smaller" often.** Agents default to generous. The best version of
  most features is a third of the first draft.

## When something breaks

Order of operations, from fastest to slowest:

1. Read the dev server log. The answer is usually the first red line.
2. `npm run typecheck`. Types catch most wiring mistakes.
3. Check the two invariants in `CLAUDE.md`. Half of all weird breakage in
   this stack is a Clerk hook imported from the wrong place or a provider
   that went client-only.
4. `npx convex dev` output. Schema validation errors show up there, not in
   Next.
5. Then ask the agent, with the log pasted.

## Tooling that fits this loop

- Claude Code in the VS Code terminal — reads the repo, runs commands, edits.
- A chat model (claude.ai) in a browser tab — planning, briefs, second opinions.
- The dev server log always visible.
- Phone on the desk, pointed at the local network URL, for mobile checks.

Nothing else is required. Add tools when a specific pain shows up, not before.
