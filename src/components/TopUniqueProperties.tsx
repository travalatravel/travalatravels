"use client";

import Link from "next/link";
import Carousel from "./Carousel";
import { TOP_UNIQUE_PROPERTIES } from "@/data/site-data";
import { Building2 } from "lucide-react";

export default function TopUniqueProperties() {
  return (
    <section className="bg-white py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#1e2e5e] sm:text-2xl md:text-3xl">
          Top Unique Properties
        </h2>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Find the most distinctive places to stay on Travala
        </p>

        <div className="mt-8">
          <Carousel>
            {TOP_UNIQUE_PROPERTIES.map((item) => (
              <Link
                key={item.slug}
                href={`/search?type=stays&q=${encodeURIComponent(item.name)}`}
                className="w-44 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-[#2577be]/40 hover:shadow-md sm:w-52"
              >
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#eef5fc] to-[#dbeafe]">
                  <Building2 size={36} className="text-[#2577be]" />
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-[#1e2e5e]">{item.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.properties.toLocaleString()} properties
                  </p>
                </div>
              </Link>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
