import Link from "next/link";
import OfferImage from "@/components/OfferImage";
import OfferLocation from "@/components/OfferLocation";
import PriceDisplay from "@/components/PriceDisplay";
import { getOfferPricing } from "@/lib/pricing";
import { Star, Tag } from "lucide-react";
import type { Offer } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";

export default function OfferCard({ offer }: { offer: Offer }) {
  const pricing = getOfferPricing(offer.price, offer.id, offer.stars);

  return (
    <Link
      href={`/offers/${offer.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#2577be]/30 hover:shadow-md"
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
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-[#2577be] px-2.5 py-1 text-[10px] font-bold text-white shadow">
            <Tag size={10} />
            Save {pricing.discountPct}%
          </span>
        )}

        <span className="absolute right-3 top-3 rounded-md bg-[#1e2e5e]/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          {TYPE_LABELS[offer.type]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-[#1e2e5e] line-clamp-2 group-hover:text-[#2577be]">
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
          />
        </div>
      </div>
    </Link>
  );
}
