"use client";

import Image from "next/image";
import Link from "next/link";
import Carousel from "./Carousel";
import { PROPERTY_TYPE_TILES } from "@/data/property-types-data";
import { propertyTypePath } from "@/lib/seo-paths";
import { useTranslations } from "@/i18n/useTranslations";

export default function TopUniqueProperties() {
  const { messages: m, fmt } = useTranslations();

  return (
    <section className="bg-white py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#1a1a1a] sm:text-2xl md:text-3xl">
          {m.topProperties.title}
        </h2>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">{m.topProperties.subtitle}</p>

        <div className="mt-8">
          <Carousel>
            {PROPERTY_TYPE_TILES.map((item) => (
              <Link
                key={item.slug}
                href={propertyTypePath(item.slug)}
                className="w-40 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-[#2D83C2]/40 hover:shadow-md sm:w-48"
              >
                <div className="relative h-28 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="192px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{item.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {fmt(m.topProperties.properties, { count: item.properties.toLocaleString() })}
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
