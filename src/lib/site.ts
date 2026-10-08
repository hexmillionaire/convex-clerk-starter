/**
 * One place for the app's identity. Change these and the layout, metadata,
 * OG image, manifest route, sitemap and footer all follow.
 */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Vibe Stack";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

export const SITE_DESCRIPTION =
  "A Next.js + Convex + Clerk starter, built for people who ship with AI. Auth, realtime per-user data, dark mode and deploy — already wired.";

/** Shown in the footer and the About page. Set to your own repo once you fork. */
export const REPO_URL = "https://github.com/hexmillionaire/convex-clerk-starter";
