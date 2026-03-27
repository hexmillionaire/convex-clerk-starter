import type { MetadataRoute } from "next";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import { VERSE_COUNTS } from "@/lib/verse-counts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.divineword.app";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/bible`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/plans`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const bookPages: MetadataRoute.Sitemap = [];
  const chapterPages: MetadataRoute.Sitemap = [];
  const versePages: MetadataRoute.Sitemap = [];

  for (const book of BIBLE_BOOKS) {
    const verseCounts = VERSE_COUNTS[book.slug];

    // Book overview page
    bookPages.push({
      url: `${baseUrl}/bible/${book.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });

    for (let ch = 1; ch <= book.chapters; ch++) {
      chapterPages.push({
        url: `${baseUrl}/bible/${book.slug}/${ch}`,
        lastModified: new Date(),
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
