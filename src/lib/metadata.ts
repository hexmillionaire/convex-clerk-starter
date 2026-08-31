import type { Metadata } from "next";

export const SITE_URL = "https://www.divineword.app";
export const SITE_NAME = "Divine Word";

/**
 * Builds the social block for a page.
 *
 * Every page that set its own `openGraph` was replacing the parent's object
 * rather than merging into it, which silently dropped the inherited `images`
 * — so subpages declared `summary_large_image` and shipped no image, and every
 * shared link rendered as a blank card. Going through here means a page can't
 * define `openGraph` without also getting an image.
 */
export function socialMetadata({
  title,
  description,
  canonical,
  ogImage,
  type = "website",
}: {
  title: string;
  description: string;
  /** Path, e.g. "/bible/john/3". */
  canonical: string;
  /** Path with query, e.g. "/og?book=john&chapter=3". Defaults to the site card. */
  ogImage?: string;
  type?: "website" | "article";
}): Metadata {
  const imageUrl = `${SITE_URL}${ogImage ?? "/og"}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${canonical}` },
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
