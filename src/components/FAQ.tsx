"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "@/i18n/useTranslations";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { messages: m } = useTranslations();

  return (
    <section className="bg-gray-50 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-3 sm:px-4 lg:px-6">
        <h2 className="text-center font-[family-name:var(--font-display)] text-2xl font-bold text-[#1a1a1a] md:text-3xl">
          {m.faq.title}
        </h2>
        <div className="mt-8 space-y-3">
          {m.faq.items.map((item, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left sm:px-5"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-[#1a1a1a]">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 text-gray-400 transition ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
