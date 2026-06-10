"use client";

import Image from "next/image";
import { PARTNERS } from "@/data/site-data";
import { useTranslations } from "@/i18n/useTranslations";

export default function PartnersSection() {
  const { messages: m } = useTranslations();

  return (
    <section className="border-y border-gray-100 bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
          {m.partners.title}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {PARTNERS.map((partner) => (
            <div key={partner.name} className="flex h-10 items-center opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0">
              <Image
                src={partner.icon}
                alt={partner.name}
                width={partner.width || 120}
                height={32}
                className="h-8 w-auto max-w-[140px] object-contain"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
