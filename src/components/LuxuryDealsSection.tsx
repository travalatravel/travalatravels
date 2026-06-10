"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OfferImage from "@/components/OfferImage";
import OfferLocation from "@/components/OfferLocation";
import PriceDisplay from "@/components/PriceDisplay";
import { getOfferPricing } from "@/lib/pricing";
import type { Offer } from "@/lib/types";
import { Crown, Star, Zap } from "lucide-react";

type DealOffer = Offer & {
  pricing?: ReturnType<typeof getOfferPricing>;
};

export default function LuxuryDealsSection() {
  const [deals, setDeals] = useState<DealOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deals?limit=8")
      .then((r) => r.json())
      .then((d) => setDeals(d.deals || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-gradient-to-b from-slate-900 to-[#1e2e5e] py-10 text-white sm:py-16">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-400">
              <Crown size={16} />
              Curated luxury escapes
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl md:text-4xl">
              Today&apos;s deepest discounts
            </h2>
            <p className="mt-2 max-w-xl text-white/60">
              Hand-picked 4★ &amp; 5★ properties at prices you won&apos;t find on
              Booking.com. Limited inventory — when it&apos;s gone, it&apos;s gone.
            </p>
          </div>
          <Link
            href="/search?type=stays"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-center text-sm font-semibold backdrop-blur transition hover:bg-white/20 sm:w-auto"
          >
            View all luxury deals
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((offer) => {
              const pricing =
                offer.pricing ?? getOfferPricing(offer.price, offer.id, offer.stars);
              return (
                <Link
                  key={offer.id}
                  href={`/offers/${offer.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10"
                >
                  <div className="relative h-40 overflow-hidden sm:h-44">
                    <OfferImage
                      src={offer.image}
                      alt={offer.title}
                      metadata={offer.metadata}
                      offerType={offer.type}
                      city={offer.city}
                      country={offer.country}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold">
                      <Zap size={10} />
                      -{pricing.discountPct}%
                    </span>
                    {pricing.isLuxury && (
                      <span className="absolute right-3 top-3 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-slate-900">
                        LUXURY
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 text-[10px] font-medium text-amber-300">
                      Only {pricing.urgencyRooms} suites left
                    </span>
                  </div>
                  <div className="p-4">
                    {offer.stars && (
                      <div className="mb-2 flex gap-0.5">
                        {Array.from({ length: offer.stars }).map((_, i) => (
                          <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-amber-300">
                      {offer.title}
                    </h3>
                    <OfferLocation
                      location={offer.location}
                      country={offer.country}
                      className="mt-1 flex items-center gap-1.5 text-xs text-white/50"
                    />
                    <div className="mt-3 [&_span]:text-white [&_.line-through]:text-white/40 [&_.text-emerald-600]:text-emerald-400">
                      <PriceDisplay
                        price={offer.price}
                        offerId={offer.id}
                        stars={offer.stars}
                        size="sm"
                        perNight
                      />
                    </div>
                    <span className="mt-3 block w-full rounded-lg bg-amber-500 py-2 text-center text-xs font-bold text-slate-900 transition sm:opacity-0 sm:group-hover:opacity-100">
                      Book before price rises →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
