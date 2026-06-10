import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://travala.travel";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/search", "/api/search/"],
      disallow: ["/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
