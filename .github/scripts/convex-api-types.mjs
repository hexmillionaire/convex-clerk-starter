#!/usr/bin/env node
/**
 * CI-only: regenerate convex/_generated/api.d.ts from the files in convex/,
 * without a Convex deployment. `npx convex dev` does this for real; CI has
 * no deployment, so applying a recipe (which adds Convex modules) would
 * otherwise leave the API types stale and fail the type-check.
 *
 * Mirrors Convex's module rules: every .ts/.js file under convex/ except
 * _generated/, schema.ts, and files with an extra dot (auth.config.ts,
 * convex.config.ts, *.test.ts). Output matches `convex codegen` for apps
 * without components.
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(process.cwd(), "convex");
const modules = [];
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "_generated" && !name.startsWith(".")) walk(p);
      continue;
    }
    if (!/\.(ts|js|mts|mjs)$/.test(name)) continue;
    const base = name.replace(/\.(ts|js|mts|mjs)$/, "");
    if (base.includes(".") || (dir === root && base === "schema")) continue;
    modules.push(relative(root, join(dir, base)).split("\\").join("/"));
  }
};
walk(root);

const ident = (m) => m.replace(/[/-]/g, "_");
const key = (m) => (/^[A-Za-z_$][\w$]*$/.test(m) ? m : JSON.stringify(m));

const out = `/* eslint-disable */
/**
 * Generated \`api\` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run \`npx convex dev\`.
 * @module
 */

${modules.map((m) => `import type * as ${ident(m)} from "../${m}.js";`).join("\n")}

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
${modules.map((m) => `  ${key(m)}: typeof ${ident(m)};`).join("\n")}
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * \`\`\`js
 * const myFunctionReference = api.myModule.myFunction;
 * \`\`\`
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * \`\`\`js
 * const myFunctionReference = internal.myModule.myFunction;
 * \`\`\`
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
`;
writeFileSync(join(root, "_generated", "api.d.ts"), out);
console.log(`convex/_generated/api.d.ts: ${modules.join(", ")}`);
