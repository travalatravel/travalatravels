import Link from "next/link";
import OfferImage from "@/components/OfferImage";
import PriceDisplay from "@/components/PriceDisplay";
import { getOfferPricing } from "@/lib/pricing";
import { Star, Crown, Flame } from "lucide-react";
import type { Offer } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";

export default function OfferCard({ offer }: { offer: Offer }) {
  const pricing = getOfferPricing(offer.price, offer.id, offer.stars);

  return (
    <Link
      href={`/offers/${offer.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl"
    >
      <div className="relative h-44 overflow-hidden sm:h-48 md:h-52">
        <OfferImage
          src={offer.image}
          alt={offer.title}
          metadata={offer.metadata}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
          <Flame size={10} />
          -{pricing.discountPct}%
        </span>

        {pricing.isLuxury && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-900">
            <Crown size={10} />
            LUXURY
          </span>
        )}

        <span className="absolute left-3 top-11 rounded-full bg-[#1e2e5e]/85 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          {TYPE_LABELS[offer.type]}
        </span>

        <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-amber-300 backdrop-blur">
          {pricing.urgencyRooms} left at this price
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-[#1e2e5e] line-clamp-2 group-hover:text-[#2577be]">
          {offer.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500">{offer.location}</p>
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
          />
          <span className="mt-3 block w-full rounded-xl bg-[#1e2e5e] py-2.5 text-center text-xs font-bold text-white transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:bg-amber-500 sm:group-hover:text-slate-900">
            Secure this rate →
          </span>
        </div>
      </div>
    </Link>
  );
}
