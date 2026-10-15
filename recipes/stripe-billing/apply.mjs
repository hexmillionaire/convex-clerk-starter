#!/usr/bin/env node
/**
 * Applies the Stripe billing recipe to this project.
 *
 *   node recipes/stripe-billing/apply.mjs            # apply
 *   node recipes/stripe-billing/apply.mjs --dry-run  # show what would change
 *
 * Copies the files under ./files into place, patches three anchors
 * (schema, AUTH_ROUTES, navbar menu), appends to .env.example, and installs
 * the `stripe` package. Each patch checks for its anchor and tells you what
 * to do by hand if the anchor has moved. Safe to re-run.
 */
import { cpSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const dry = process.argv.includes("--dry-run");
const noInstall = process.argv.includes("--no-install");

const ok = (m) => console.log(`  ✓ ${m}`);
const skip = (m) => console.log(`  · ${m}`);
const manual = (m) => console.log(`  ! ${m}`);
let manualSteps = 0;

console.log(`\nStripe billing recipe → ${root}${dry ? "  (dry run)" : ""}\n`);

// 1. Copy files ─────────────────────────────────────────────────────────
console.log("Files");
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
for (const src of walk(join(here, "files"))) {
  const rel = relative(join(here, "files"), src);
  const dest = join(root, rel);
  if (existsSync(dest) && readFileSync(dest, "utf8") === readFileSync(src, "utf8")) {
    skip(`${rel} (unchanged)`);
    continue;
  }
  if (existsSync(dest) && rel === "convex/http.ts") {
    manual(`convex/http.ts already exists — merge the /stripe/webhook route from recipes/stripe-billing/files/convex/http.ts by hand`);
    manualSteps++;
    continue;
  }
  if (!dry) cpSync(src, dest);
  ok(rel);
}

// 2. Patch anchors ──────────────────────────────────────────────────────
console.log("\nPatches");

function patch(file, { anchor, insert, already, how }) {
  const p = join(root, file);
  if (!existsSync(p)) return manual(`${file} not found — ${how}`), manualSteps++;
  const s = readFileSync(p, "utf8");
  if (s.includes(already)) return skip(`${file} (already patched)`);
  if (!s.includes(anchor)) return manual(`${file}: anchor not found — ${how}`), manualSteps++;
  if (!dry) writeFileSync(p, s.replace(anchor, insert));
  ok(file);
}

patch("convex/schema.ts", {
  anchor: "export default defineSchema({\n",
  already: "subscriptions: defineTable(",
  insert: `export default defineSchema({
  // ─── Stripe billing (recipes/stripe-billing) ───
  // One row per user who has ever started checkout. \`status\` mirrors
  // Stripe's subscription status; "none" means a customer exists but no
  // subscription does.
  subscriptions: defineTable({
    userId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
    status: v.string(),
    priceId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_customer", ["stripeCustomerId"]),

`,
  how: "add the `subscriptions` table from recipes/stripe-billing/README.md to convex/schema.ts",
});

patch("src/lib/auth.tsx", {
  anchor: `const AUTH_ROUTES = ["/login", "/dashboard"];`,
  already: `"/billing"`,
  insert: `const AUTH_ROUTES = ["/login", "/dashboard", "/billing"];`,
  how: `add "/billing" to AUTH_ROUTES in src/lib/auth.tsx`,
});

patch("src/components/navbar.tsx", {
  anchor: `                <Link href="/dashboard">
                  <DropdownMenuItem className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
`,
  already: `href="/billing"`,
  insert: `                <Link href="/dashboard">
                  <DropdownMenuItem className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/billing">
                  <DropdownMenuItem className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                </Link>
`,
  how: `add a Billing link to the account dropdown in src/components/navbar.tsx`,
});

patch("src/components/navbar.tsx", {
  anchor: `import { Home, LayoutDashboard, Info, User, LogOut, Github } from "lucide-react";`,
  already: `CreditCard } from "lucide-react"`,
  insert: `import { Home, LayoutDashboard, Info, User, LogOut, Github, CreditCard } from "lucide-react";`,
  how: `import CreditCard from lucide-react in src/components/navbar.tsx`,
});

patch("src/app/robots.ts", {
  anchor: `disallow: ["/api/", "/login", "/dashboard"],`,
  already: `"/billing"`,
  insert: `disallow: ["/api/", "/login", "/dashboard", "/billing"],`,
  how: `add "/billing" to the disallow list in src/app/robots.ts`,
});

// 3. .env.example ───────────────────────────────────────────────────────
console.log("\nEnv");
{
  const p = join(root, ".env.example");
  const block = `
# ── Stripe (recipes/stripe-billing) ─────────────────────────────────────
# These live on the CONVEX deployment, not in this file. Listed so you know
# what to set:
#   npx convex env set STRIPE_SECRET_KEY sk_test_...
#   npx convex env set STRIPE_WEBHOOK_SECRET whsec_...
#   npx convex env set STRIPE_PRICE_ID price_...
#   npx convex env set SITE_URL http://localhost:3000
`;
  const s = existsSync(p) ? readFileSync(p, "utf8") : "";
  if (s.includes("STRIPE_SECRET_KEY")) skip(".env.example (already has the Stripe block)");
  else {
    if (!dry) writeFileSync(p, s.replace(/\n*$/, "\n") + block);
    ok(".env.example");
  }
}

// 4. Dependency ─────────────────────────────────────────────────────────
console.log("\nDependency");
{
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  if (pkg.dependencies?.stripe) skip("stripe already installed");
  else if (dry || noInstall) manual("run: npm install stripe"), manualSteps++;
  else {
    execSync("npm install stripe", { cwd: root, stdio: "inherit" });
    ok("npm install stripe");
  }
}

// 5. What's left ────────────────────────────────────────────────────────
console.log(`
Next
  1. Stripe Dashboard → Products → create a recurring price, copy its price_… id
  2. npx convex env set STRIPE_SECRET_KEY sk_test_…
     npx convex env set STRIPE_PRICE_ID price_…
     npx convex env set SITE_URL http://localhost:3000
  3. Webhook (local):  stripe listen --forward-to https://<your-deployment>.convex.site/stripe/webhook
     then  npx convex env set STRIPE_WEBHOOK_SECRET whsec_…   (the one stripe listen prints)
  4. npx convex dev   (regenerates _generated/ with the new functions)
  5. Open /billing, click Upgrade, pay with 4242 4242 4242 4242.
${manualSteps ? `\n  ${manualSteps} step(s) above need a hand — marked with !` : ""}
Full walkthrough: recipes/stripe-billing/README.md
`);
