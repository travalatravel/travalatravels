"use client";

import Link from "next/link";
import { useState } from "react";
import { TRAVEL_GUIDE_CATEGORIES } from "@/data/site-data";
import { TRAVEL_GUIDES_DATA } from "@/data/travel-guides-data";
import { useTranslations } from "@/i18n/useTranslations";

const CATEGORY_SLUGS: Record<string, string> = {
  "Travel Planning": "travel-planning",
  CRYPTO: "crypto",
  "Travel Destination": "travel-destinations-2",
  "Accommodation Guides": "accommodation-guides",
  "Travel Trends": "travel-trends",
  News: "news",
};

const CATEGORY_BLOG_URLS: Record<string, string> = {
  "travel-planning": "https://www.travala.com/blog/category/travel-planning/",
  crypto: "https://www.travala.com/blog/category/living-with-crypto/",
  "travel-destination": "https://www.travala.com/blog/category/travel-destination/",
  "accommodation-guides": "https://www.travala.com/blog/category/accommodation-guides/",
  "travel-trends": "https://www.travala.com/blog/category/travel-trends/",
  news: "https://www.travala.com/blog/category/news/",
};

export default function TravelGuides() {
  const [active, setActive] = useState(TRAVEL_GUIDE_CATEGORIES[0]);
  const { messages: m } = useTranslations();
  const slug = CATEGORY_SLUGS[active] || "travel-planning";
  const guides = TRAVEL_GUIDES_DATA[slug] || [];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#1a1a1a] md:text-3xl">
            {m.travelGuides.title}
          </h2>
          <Link
            href={CATEGORY_BLOG_URLS[slug] || "https://www.travala.com/blog"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#2D83C2] hover:underline"
          >
            {m.common.showMore}
          </Link>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto border-b border-gray-200 pb-0 scrollbar-hide">
          {TRAVEL_GUIDE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition ${
                active === cat
                  ? "border-b-2 border-[#2D83C2] text-[#2D83C2]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <ul className="mt-6 divide-y divide-gray-100">
          {guides.map((guide) => (
            <li key={guide.url}>
              <Link
                href={guide.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-4 text-sm text-[#1a1a1a] transition hover:text-[#2D83C2]"
              >
                {guide.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
