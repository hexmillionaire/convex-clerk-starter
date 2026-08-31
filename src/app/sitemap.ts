import type { MetadataRoute } from "next";
import { BIBLE_BOOKS } from "@/lib/bible-data";

/**
 * The sitemap listed all 30,856 verse URLs alongside the chapters.
 *
 * Verse pages are good for people and bad as index candidates: thirty thousand
 * near-duplicate one-line pages mostly land in "Crawled — currently not
 * indexed" while spending the crawl budget that should reach the 1,189
 * chapters. They still work, and each now canonicalises to its chapter, so
 * they're simply not submitted.
 *
 * The old list was also wrong. It was generated from a hand-maintained
 * VERSE_COUNTS table whose 1 Samuel entries were off from chapter 20 on,
 * submitting 70 URLs that 404 and omitting 16 verses that exist. That table is
 * now generated from the vendored scripture (see scripts/vendor-kjv.mjs).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.divineword.app";
  const staticDate = new Date("2025-01-01");

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/bible`, lastModified: staticDate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: staticDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/plans`, lastModified: staticDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/verse-of-the-day`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: staticDate, changeFrequency: "yearly", priority: 0.5 },
  ];

  const bookPages: MetadataRoute.Sitemap = BIBLE_BOOKS.map((book) => ({
    url: `${baseUrl}/bible/${book.slug}`,
    lastModified: staticDate,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const chapterPages: MetadataRoute.Sitemap = BIBLE_BOOKS.flatMap((book) =>
    Array.from({ length: book.chapters }, (_, i) => ({
      url: `${baseUrl}/bible/${book.slug}/${i + 1}`,
      lastModified: staticDate,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...bookPages, ...chapterPages];
}
