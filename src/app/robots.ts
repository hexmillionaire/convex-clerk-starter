import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.divineword.app";

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login", "/auth/", "/dashboard", "/prayers"],
        // No crawl-delay: Googlebot and Bingbot have their own exempt rules
        // above, so it only ever throttled the other crawlers — including the
        // social and AI ones that would surface the scripture.
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
