import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";

/**
 * Builds the social block for a page.
 *
 * Next.js metadata does not deep-merge: a page that sets its own `openGraph`
 * replaces the parent's object and silently drops the inherited `images`. So
 * a subpage can declare `summary_large_image` and ship no image, and every
 * shared link renders as a blank card. Going through here means a page can't
 * define `openGraph` without also getting an image.
 */
export function socialMetadata({
  title,
  description,
  canonical,
  ogImage,
  type = "website",
  noIndex = false,
}: {
  title: string;
  description: string;
  /** Path, e.g. "/about". */
  canonical: string;
  /** Path with query, e.g. "/og?title=Hello". Defaults to the site card. */
  ogImage?: string;
  type?: "website" | "article";
  /** For signed-in-only pages that shouldn't be in search results. */
  noIndex?: boolean;
}): Metadata {
  const imageUrl = `${SITE_URL}${ogImage ?? "/og"}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${canonical}` },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      type,
      siteName: SITE_NAME,
      url: `${SITE_URL}${canonical}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
