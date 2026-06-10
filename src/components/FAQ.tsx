"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/data/site-data";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-gray-50 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-3 sm:px-4 lg:px-6">
        <h2 className="text-center font-[family-name:var(--font-display)] text-2xl font-bold text-[#1e2e5e] md:text-3xl">
          FAQs
        </h2>
        <div className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left sm:px-5"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-[#1e2e5e]">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 text-gray-400 transition ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-600 leading-relaxed">
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
