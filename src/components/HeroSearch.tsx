"use client";

import { Suspense, useState } from "react";
import SearchForm from "./SearchForm";
import SafeImage from "./SafeImage";
import { ASSETS } from "@/data/site-data";
import { FLIGHT_HERO } from "@/data/flight-data";

const HERO_COPY: Record<string, { title: string; subtitle: string; bg?: string }> = {
  stays: {
    title: "Book Hotels & SAVE UP TO 60%",
    subtitle: "Best Prices Guaranteed on 2,200,000+ Hotels Worldwide",
    bg: ASSETS.heroBg,
  },
  flights: {
    title: FLIGHT_HERO.title,
    subtitle: FLIGHT_HERO.subtitle,
    bg: FLIGHT_HERO.background,
  },
  "car-rental": {
    title: "BOOK CAR RENTALS WITH CRYPTO",
    subtitle: "Compare deals from top rental companies worldwide",
    bg: ASSETS.heroBg,
  },
  activities: {
    title: "BOOK ACTIVITIES & TOURS",
    subtitle: "Best prices on 410,000+ experiences worldwide",
    bg: ASSETS.heroBg,
  },
};

export default function HeroSearch({ defaultTab = "stays" }: { defaultTab?: string }) {
  const [tab, setTab] = useState(defaultTab);
  const copy = HERO_COPY[tab] || HERO_COPY.stays;

  return (
    <section className="relative min-h-[480px] overflow-hidden pb-10 pt-6 sm:min-h-[540px] sm:pb-14 lg:min-h-[600px] lg:pb-16">
      <SafeImage
        src={copy.bg || ASSETS.heroBg}
        fallbackSrc={ASSETS.heroBg}
        alt="Travel booking background"
        fill
        fallbackClassName="bg-[#1e2e5e]"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#1e2e5e]/40" aria-hidden />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-8 text-center sm:pt-12 lg:pt-14">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
          {copy.title}
        </h1>
        <h2 className="mx-auto mt-3 max-w-2xl text-sm text-white/90 sm:text-base md:text-lg">
          {copy.subtitle}
        </h2>

        <div className="mx-auto mt-8 w-full max-w-4xl sm:mt-10">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-white/20" />}>
            <SearchForm defaultType={defaultTab} onTypeChange={setTab} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
