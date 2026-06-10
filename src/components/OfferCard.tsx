"use client";

import Link from "next/link";
import OfferImage from "@/components/OfferImage";
import OfferLocation from "@/components/OfferLocation";
import PriceDisplay from "@/components/PriceDisplay";
import { getOfferPricing } from "@/lib/pricing";
import { parseTravalaSlug } from "@/lib/hotel-slug";
import { Star, Tag } from "lucide-react";
import type { Offer } from "@/lib/types";
import type { LivePriceResult } from "@/lib/travala-price";
import { useTranslations } from "@/i18n/useTranslations";
import { offerTypeLabel } from "@/i18n/display-labels";

export default function OfferCard({
  offer,
  searchContext,
  livePrice,
  priceLoading = false,
}: {
  offer: Offer;
  searchContext?: { checkIn?: string; checkOut?: string; guests?: string; rooms?: string };
  livePrice?: LivePriceResult | null;
  priceLoading?: boolean;
}) {
  const { messages: m, fmt } = useTranslations();
  const pricing = getOfferPricing(offer.price, offer.id, offer.stars);
  const slug = offer.type === "HOTEL" ? parseTravalaSlug(offer.metadata) : null;

  const detailParams = new URLSearchParams();
  if (searchContext?.checkIn) detailParams.set("checkIn", searchContext.checkIn);
  if (searchContext?.checkOut) detailParams.set("checkOut", searchContext.checkOut);
  if (searchContext?.guests) detailParams.set("guests", searchContext.guests);
  if (searchContext?.rooms) detailParams.set("rooms", searchContext.rooms);
  const qs = detailParams.toString();

  const href = slug
    ? `/hotel/${slug}${qs ? `?${qs}` : ""}`
    : `/offers/${offer.id}${qs ? `?${qs}` : ""}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#2D83C2]/30 hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden sm:h-48 md:h-52">
        <OfferImage
          src={offer.image}
          alt={offer.title}
          metadata={offer.metadata}
          offerType={offer.type}
          city={offer.city}
          country={offer.country}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {pricing.discountPct > 0 && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-[#2D83C2] px-2.5 py-1 text-[10px] font-bold text-white shadow">
            <Tag size={10} />
            {fmt(m.common.savePctGuarantee, { pct: pricing.discountPct })}
          </span>
        )}

        <span className="absolute right-3 top-3 rounded-md bg-[#1a5f94]/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          {offerTypeLabel(m, offer.type)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-[#1a1a1a] line-clamp-2 group-hover:text-[#2D83C2]">
          {offer.title}
        </h3>
        <OfferLocation location={offer.location} country={offer.country} />
        {offer.stars && (
          <div className="mt-2 flex gap-0.5">
            {Array.from({ length: offer.stars }).map((_, i) => (
              <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
        )}
        <div className="mt-auto pt-3">
          <PriceDisplay
            price={offer.price}
            offerId={offer.id}
            stars={offer.stars}
            perNight={offer.type === "HOTEL"}
            showCrypto
            livePricePerNight={livePrice?.pricePerNight}
            priceLoading={priceLoading}
            isLive={livePrice?.source === "travala"}
          />
        </div>
      </div>
    </Link>
  );
}
