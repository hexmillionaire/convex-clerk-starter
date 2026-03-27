/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bible from "../bible.js";
import type * as bookmarks from "../bookmarks.js";
import type * as highlights from "../highlights.js";
import type * as http from "../http.js";
import type * as journal from "../journal.js";
import type * as readingPlans from "../readingPlans.js";
import type * as readingProgress from "../readingProgress.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bible: typeof bible;
  bookmarks: typeof bookmarks;
  highlights: typeof highlights;
  http: typeof http;
  journal: typeof journal;
  readingPlans: typeof readingPlans;
  readingProgress: typeof readingProgress;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
