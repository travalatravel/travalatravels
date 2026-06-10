"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useTranslations } from "@/i18n/useTranslations";

export default function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { messages: m } = useTranslations();

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const amount = Math.min(ref.current.clientWidth * 0.85, 320);
    ref.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative -mx-1 px-1 sm:mx-0 sm:px-0">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50 md:flex"
        aria-label={m.common.previous}
      >
        <ChevronLeft size={18} />
      </button>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 scrollbar-hide sm:gap-4"
      >
        {children}
      </div>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50 md:flex"
        aria-label={m.common.next}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
