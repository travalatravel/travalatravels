import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://travala.travel";
  const now = new Date();

  const pages = [
    "",
    "/search?type=stays",
    "/stays",
    "/flights",
    "/car-rental",
    "/activities",
    "/login",
    "/register",
  ];

  return pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
