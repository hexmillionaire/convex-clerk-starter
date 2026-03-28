import type { MetadataRoute } from "next";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import { VERSE_COUNTS } from "@/lib/verse-counts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.divineword.app";
  const staticDate = new Date("2025-01-01");

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/bible`, lastModified: staticDate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: staticDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/plans`, lastModified: staticDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/verse-of-the-day`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  const bookPages: MetadataRoute.Sitemap = [];
  const chapterPages: MetadataRoute.Sitemap = [];
  const versePages: MetadataRoute.Sitemap = [];

  for (const book of BIBLE_BOOKS) {
    const verseCounts = VERSE_COUNTS[book.slug];

    // Book overview page
    bookPages.push({
      url: `${baseUrl}/bible/${book.slug}`,
      lastModified: staticDate,
      changeFrequency: "monthly",
      priority: 0.7,
    });

    for (let ch = 1; ch <= book.chapters; ch++) {
      chapterPages.push({
        url: `${baseUrl}/bible/${book.slug}/${ch}`,
        lastModified: staticDate,
        changeFrequency: "yearly",
        priority: 0.6,
      });

      // Add individual verse pages
      const numVerses = verseCounts?.[ch - 1] ?? 0;
      for (let v = 1; v <= numVerses; v++) {
        versePages.push({
          url: `${baseUrl}/bible/${book.slug}/${ch}/${v}`,
          changeFrequency: "yearly",
          priority: 0.5,
        });
      }
    }
  }

  return [...staticPages, ...bookPages, ...chapterPages, ...versePages];
}
