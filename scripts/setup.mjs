#!/usr/bin/env node
/**
 * First-run setup. Asks for the few values that can't be guessed, writes
 * .env.local, and prints the two commands left to run. Safe to re-run: it
 * keeps anything already set and only asks for what's missing.
 *
 * No dependencies — plain Node so it runs before `npm install` has finished
 * if someone is impatient.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const ENV_PATH = ".env.local";

const rl = createInterface({ input: stdin, output: stdout });
const ask = async (q, fallback = "") => {
  const a = (await rl.question(fallback ? `${q} [${fallback}]: ` : `${q}: `)).trim();
  return a || fallback;
};

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;

function readEnv() {
  if (!existsSync(ENV_PATH)) return {};
  return Object.fromEntries(
    readFileSync(ENV_PATH, "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
  );
}

const env = readEnv();

console.log(`\n${bold("Vibe Stack setup")}\n`);
console.log(dim("You need a free Clerk account (clerk.com). Convex is created by its CLI in a moment.\n"));

console.log(bold("1. Clerk keys") + dim("  — Clerk Dashboard → your app → API Keys"));
env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = await ask(
  "   Publishable key (pk_test_…)",
  env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);
env.CLERK_SECRET_KEY = await ask("   Secret key (sk_test_…)", env.CLERK_SECRET_KEY);

console.log(`\n${bold("2. Clerk JWT template")} ${dim("— Clerk Dashboard → JWT Templates → New → pick “Convex”")}`);
console.log(dim("   The template must be named exactly  convex . Copy its Issuer URL."));
env.CLERK_JWT_ISSUER_DOMAIN = await ask(
  "   Issuer URL (https://….clerk.accounts.dev)",
  env.CLERK_JWT_ISSUER_DOMAIN
);

console.log(`\n${bold("3. Site")}`);
env.NEXT_PUBLIC_SITE_NAME = await ask("   App name", env.NEXT_PUBLIC_SITE_NAME || "Vibe Stack");
env.NEXT_PUBLIC_SITE_URL = await ask("   Site URL", env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

rl.close();

// Convex fills these itself on first `npx convex dev`; keep whatever exists.
env.CONVEX_DEPLOYMENT ??= "";
env.NEXT_PUBLIC_CONVEX_URL ??= "";

const out = [
  "# Written by scripts/setup.mjs — edit freely, re-run `npm run setup` to update.",
  "",
  "# Convex (filled in by `npx convex dev`)",
  `CONVEX_DEPLOYMENT=${env.CONVEX_DEPLOYMENT}`,
  `NEXT_PUBLIC_CONVEX_URL=${env.NEXT_PUBLIC_CONVEX_URL}`,
  "",
  "# Clerk",
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}`,
  `CLERK_SECRET_KEY=${env.CLERK_SECRET_KEY}`,
  `CLERK_JWT_ISSUER_DOMAIN=${env.CLERK_JWT_ISSUER_DOMAIN}`,
  "",
  "# Site",
  `NEXT_PUBLIC_SITE_NAME=${env.NEXT_PUBLIC_SITE_NAME}`,
  `NEXT_PUBLIC_SITE_URL=${env.NEXT_PUBLIC_SITE_URL}`,
  "",
].join("\n");

writeFileSync(ENV_PATH, out);
console.log(`\n${green("✓")} Wrote ${ENV_PATH}\n`);

console.log(bold("Two commands left:\n"));
console.log(`  ${bold("npx convex dev")}`);
console.log(dim("     Creates your Convex project, writes NEXT_PUBLIC_CONVEX_URL, pushes the schema."));
console.log(dim("     Leave it running. In a second terminal:\n"));
console.log(`  ${bold(`npx convex env set CLERK_JWT_ISSUER_DOMAIN ${env.CLERK_JWT_ISSUER_DOMAIN}`)}`);
console.log(dim("     Convex validates Clerk tokens server-side, so it needs the issuer too.\n"));
console.log(`Then ${bold("npm run dev")} and open http://localhost:3000. Or ${bold("npm run dev:all")} to run Next and Convex together.\n`);
