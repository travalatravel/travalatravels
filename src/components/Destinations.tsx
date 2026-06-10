"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import Carousel from "./Carousel";
import SafeImage from "./SafeImage";
import { DESTINATION_DATA, REGIONS } from "@/data/site-data";
import { hotelsCityPath, hotelsCountryPath, searchStaysPath } from "@/lib/seo-paths";
import { useTranslations } from "@/i18n/useTranslations";

function ExploreLabel() {
  return (
    <div className="relative font-[family-name:var(--font-satisfy)] text-2xl text-[#aaa] before:absolute before:right-[calc(100%+16px)] before:top-1/2 before:h-0 before:w-4 before:-translate-y-1/2 before:border-t before:border-[#cfcfcf] after:absolute after:left-[calc(100%+16px)] after:top-1/2 after:h-0 after:w-4 after:-translate-y-1/2 after:border-t after:border-[#cfcfcf] lg:text-4xl lg:before:w-7 lg:after:w-7">
      Explore
    </div>
  );
}

function DestinationCard({
  href,
  image,
  title,
  subtitle,
  stars,
}: {
  href: string;
  image: string;
  title: string;
  subtitle?: string;
  stars?: number;
}) {
  return (
    <Link
      href={href}
      className="group block h-[220px] w-[42vw] max-w-[200px] flex-shrink-0 snap-start overflow-hidden rounded-md bg-white shadow-[0_0_10px_rgba(0,0,0,0.2)] transition hover:shadow-[0_0_10px_rgba(0,0,0,0.4)] sm:h-[260px] sm:w-[200px]"
    >
      <div className="relative h-[58%] overflow-hidden">
        <Image src={image} alt={title} fill sizes="200px" className="object-cover transition duration-300 group-hover:scale-105" />
      </div>
      <div className="flex h-[42%] flex-col justify-center px-4 pl-10">
        <p className="text-sm font-semibold text-[#333] transition group-hover:text-[#2D83C2] group-hover:underline">
          {title}
        </p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        {stars && (
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Destinations() {
  const [activeRegion, setActiveRegion] = useState(REGIONS[0].id);
  const { messages: m } = useTranslations();
  const data = DESTINATION_DATA[activeRegion];

  return (
    <section className="bg-white pb-16 pt-10 sm:pb-[72px] sm:pt-14" data-testid="popular-travel-destinations-worldwide-section">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <ExploreLabel />
          <h2 className="text-2xl font-bold text-[#333] lg:text-[30px] lg:leading-[37px]">
            {m.destinations.title}
          </h2>
          <p className="max-w-2xl text-sm font-medium text-gray-600">
            {m.destinations.explore}
          </p>
        </div>

        <ul className="mt-8 flex flex-wrap justify-center gap-2 lg:gap-2.5">
          {REGIONS.map((region) => {
            const active = activeRegion === region.id;
            return (
              <li key={region.id}>
                <button
                  type="button"
                  onClick={() => setActiveRegion(region.id)}
                  className={`cursor-pointer px-2 pb-2 text-sm font-medium text-[#979696] lg:flex lg:h-9 lg:items-center lg:justify-center lg:rounded lg:border lg:px-2 lg:text-xs lg:font-semibold lg:uppercase lg:transition ${
                    active
                      ? "text-[#1e2e5e] underline decoration-2 underline-offset-8 lg:border-[#2D83C2] lg:bg-[#2D83C2] lg:text-white lg:no-underline"
                      : "lg:border-[#2D83C2] lg:bg-white lg:text-[#2D83C2] hover:lg:bg-[#eaf3f9]"
                  }`}
                >
                  {m.destinations.regions[region.id as keyof typeof m.destinations.regions] || region.label}
                </button>
              </li>
            );
          })}
        </ul>

        {data && (
          <div className="mt-10 space-y-10">
            <div>
              <h3 className="mb-4 text-base font-semibold text-[#333]">{m.destinations.tabs.countries}</h3>
              <Carousel>
                {data.countries.map((item) => (
                  <DestinationCard
                    key={item.name}
                    href={hotelsCountryPath(item.name)}
                    image={item.image}
                    title={item.name}
                  />
                ))}
              </Carousel>
            </div>

            <div>
              <h3 className="mb-4 text-base font-semibold text-[#333]">{m.destinations.tabs.cities}</h3>
              <Carousel>
                {data.cities.map((item) => (
                  <DestinationCard
                    key={item.name}
                    href={hotelsCityPath(item.country || item.name, item.name)}
                    image={item.image}
                    title={item.name}
                    subtitle={item.country}
                  />
                ))}
              </Carousel>
            </div>

            <div>
              <h3 className="mb-4 text-base font-semibold text-[#333]">{m.destinations.tabs.hotels}</h3>
              <Carousel>
                {data.hotels.map((item) => (
                  <Link
                    key={item.name}
                    href={searchStaysPath(item.name)}
                    className="group block h-[220px] w-[72vw] max-w-[240px] flex-shrink-0 snap-start overflow-hidden rounded-md bg-white shadow-[0_0_10px_rgba(0,0,0,0.2)] transition hover:shadow-[0_0_10px_rgba(0,0,0,0.4)] sm:h-[260px] sm:w-56"
                  >
                    <div className="relative h-[58%] overflow-hidden">
                      <SafeImage src={item.image} alt={item.name} fill className="transition duration-300 group-hover:scale-105" />
                    </div>
                    <div className="p-4 pl-10">
                      <p className="line-clamp-2 text-sm font-semibold text-[#333] group-hover:text-[#2D83C2]">
                        {item.name}
                      </p>
                      {item.stars && (
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: item.stars }).map((_, i) => (
                            <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      )}
                      <p className="mt-0.5 text-xs text-gray-500">{item.country}</p>
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
