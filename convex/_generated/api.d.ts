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
import type * as cronActions from "../cronActions.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as highlights from "../highlights.js";
import type * as http from "../http.js";
import type * as journal from "../journal.js";
import type * as lib_books from "../lib/books.js";
import type * as lib_clean from "../lib/clean.js";
import type * as lib_streak from "../lib/streak.js";
import type * as migrations from "../migrations.js";
import type * as milestones from "../milestones.js";
import type * as prayerJournal from "../prayerJournal.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as pushSend from "../pushSend.js";
import type * as pushSubscriptions from "../pushSubscriptions.js";
import type * as readingPlans from "../readingPlans.js";
import type * as readingProgress from "../readingProgress.js";
import type * as seed from "../seed.js";
import type * as stats from "../stats.js";
import type * as userSettings from "../userSettings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bible: typeof bible;
  bookmarks: typeof bookmarks;
  cronActions: typeof cronActions;
  crons: typeof crons;
  dashboard: typeof dashboard;
  highlights: typeof highlights;
  http: typeof http;
  journal: typeof journal;
  "lib/books": typeof lib_books;
  "lib/clean": typeof lib_clean;
  "lib/streak": typeof lib_streak;
  migrations: typeof migrations;
  milestones: typeof milestones;
  prayerJournal: typeof prayerJournal;
  pushNotifications: typeof pushNotifications;
  pushSend: typeof pushSend;
  pushSubscriptions: typeof pushSubscriptions;
  readingPlans: typeof readingPlans;
  readingProgress: typeof readingProgress;
  seed: typeof seed;
  stats: typeof stats;
  userSettings: typeof userSettings;
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
