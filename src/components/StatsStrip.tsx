"use client";

import { useTranslations } from "@/i18n/useTranslations";

export default function StatsStrip() {
  const { messages: m } = useTranslations();

  return (
    <section className="bg-[#2D83C2] py-6 text-white">
      <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-3 text-center sm:px-4">
        {m.stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-xl font-bold sm:text-2xl">{stat.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-white/80 sm:text-xs">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
