import type { MetadataRoute } from "next";
import { BIBLE_BOOKS } from "@/lib/bible-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theword.app";

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/bible`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/plans`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  // Generate URLs for every chapter of every book
  const chapterPages = BIBLE_BOOKS.flatMap((book) =>
    Array.from({ length: book.chapters }, (_, i) => ({
      url: `${baseUrl}/bible/${book.slug}/${i + 1}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }))
  );

  return [...staticPages, ...chapterPages];
}
