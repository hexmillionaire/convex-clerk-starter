import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.divineword.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login", "/auth/", "/dashboard", "/prayers"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
