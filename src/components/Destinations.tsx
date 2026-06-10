"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import Carousel from "./Carousel";
import SafeImage from "./SafeImage";
import { DESTINATION_DATA, REGIONS } from "@/data/site-data";

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function Destinations() {
  const [activeRegion, setActiveRegion] = useState(REGIONS[0].id);
  const data = DESTINATION_DATA[activeRegion];

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">Luxury destinations</p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#1e2e5e] md:text-3xl">
          Where will you escape next?
        </h2>
        <p className="mt-2 text-gray-500">
          Iconic cities &amp; hidden gems — 5-star properties at insider rates
        </p>

        <div className="mt-8 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => setActiveRegion(region.id)}
              className={`relative flex-shrink-0 overflow-hidden rounded-xl transition ${
                activeRegion === region.id ? "ring-2 ring-[#2577be] ring-offset-2" : ""
              }`}
            >
              <div className="relative h-24 w-36">
                <Image src={region.image} alt={region.label} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-xs font-semibold text-white leading-tight">
                  {region.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {data && (
          <div className="mt-10 space-y-10">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#1e2e5e]">Most Visited Countries</h3>
              <Carousel>
                {data.countries.map((item) => (
                  <Link key={item.name} href={`/search?type=stays&q=${encodeURIComponent(item.name)}`} className="w-36 flex-shrink-0">
                    <div className="relative h-28 overflow-hidden rounded-xl">
                      <Image src={item.image} alt={item.name} fill className="object-cover transition hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-sm font-semibold text-white">{item.name}</span>
                    </div>
                  </Link>
                ))}
              </Carousel>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#1e2e5e]">Top Cities</h3>
              <Carousel>
                {data.cities.map((item) => (
                  <Link key={item.name} href={`/search?type=stays&q=${encodeURIComponent(item.name)}`} className="w-40 flex-shrink-0">
                    <div className="relative h-32 overflow-hidden rounded-xl">
                      <Image src={item.image} alt={item.name} fill className="object-cover transition hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-2 left-2">
                        <div className="text-sm font-semibold text-white">{item.name}</div>
                        <div className="text-xs text-white/80">{item.country}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </Carousel>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#1e2e5e]">Popular Hotels</h3>
              <Carousel>
                {data.hotels.map((item) => (
                  <Link key={item.name} href={`/search?type=stays&q=${encodeURIComponent(item.name)}`} className="w-56 flex-shrink-0">
                    <div className="relative h-36 overflow-hidden rounded-xl">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        fill
                        className="transition hover:scale-105"
                      />
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-semibold text-[#1e2e5e] line-clamp-2">{item.name}</div>
                      {item.stars && <Stars count={item.stars} />}
                      <div className="mt-0.5 text-xs text-gray-500">{item.country}</div>
                    </div>
                  </Link>
                ))}
              </Carousel>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
