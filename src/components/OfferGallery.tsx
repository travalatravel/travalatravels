"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { isGenericTravalaImage, travalaSlugFromOffer } from "@/lib/travala-image";

type Props = {
  title: string;
  fallbackImage: string;
  metadata?: string | null;
};

export default function OfferGallery({ title, fallbackImage, metadata }: Props) {
  const [photos, setPhotos] = useState<string[]>([fallbackImage]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const slug = travalaSlugFromOffer(metadata ?? null);
    if (!slug) return;

    setLoading(true);
    fetch(`/api/hotel-images?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.photos?.length) {
          setPhotos(data.photos);
          setActive(0);
        } else if (isGenericTravalaImage(fallbackImage)) {
          fetch(`/api/hotel-image?slug=${encodeURIComponent(slug)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((img) => {
              if (img?.url) setPhotos([img.url]);
            });
        }
      })
      .finally(() => setLoading(false));
  }, [metadata, fallbackImage]);

  const current = photos[active] || fallbackImage;
  const hasMany = photos.length > 1;

  const prev = () => setActive((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setActive((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <div className="w-full min-w-0 max-w-full space-y-2 sm:space-y-3">
      <div className="relative aspect-[4/3] max-h-[min(52vw,240px)] w-full min-w-0 overflow-hidden rounded-xl bg-gray-100 sm:max-h-none sm:aspect-[16/10] sm:rounded-2xl md:aspect-[16/9]">
        <Image
          src={current}
          alt={`${title} — photo ${active + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
          className="object-cover"
          priority
          unoptimized={current.includes("travelapi.com")}
        />

        {hasMany && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur sm:left-3 sm:h-10 sm:w-10"
              aria-label="Previous photo"
            >
              <ChevronLeft size={18} className="sm:h-[22px] sm:w-[22px]" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur sm:right-3 sm:h-10 sm:w-10"
              aria-label="Next photo"
            >
              <ChevronRight size={18} className="sm:h-[22px] sm:w-[22px]" />
            </button>
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur sm:bottom-3 sm:right-3 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs">
              <Images size={12} className="sm:h-3.5 sm:w-3.5" />
              {active + 1} / {photos.length}
            </div>
          </>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        )}
      </div>

      {hasMany && (
        <div className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-24 md:h-20 md:w-28 ${
                i === active ? "border-[#2577be] ring-2 ring-[#2577be]/30" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized={src.includes("travelapi.com")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
