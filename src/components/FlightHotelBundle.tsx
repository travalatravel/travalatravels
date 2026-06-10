"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Check, Star } from "lucide-react";
import OfferImage from "./OfferImage";
import type { Offer } from "@/lib/types";
import {
  BUNDLE_HOTEL_EXTRA_DISCOUNT_PCT,
  bundleHotelFromOffer,
  calcBundleHotelPrice,
  type BundleHotelSelection,
} from "@/lib/flight-hotel-bundle";
import { formatUsd } from "@/lib/pricing";
import { useTranslations } from "@/i18n/useTranslations";

export default function FlightHotelBundle({
  destination,
  depart,
  returnDate,
  guests = 2,
  selectedHotelId,
  onSelectHotel,
  compact = false,
}: {
  destination: string;
  depart?: string;
  returnDate?: string;
  guests?: number;
  selectedHotelId?: string | null;
  onSelectHotel?: (bundle: BundleHotelSelection | null) => void;
  compact?: boolean;
}) {
  const { messages: m, fmt } = useTranslations();
  const b = m.bundle;
  const [hotels, setHotels] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const checkIn = depart || "";
  const checkOut = returnDate || depart || "";

  useEffect(() => {
    if (!destination.trim()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      type: "stays",
      q: destination,
      limit: compact ? "4" : "6",
      sort: "stars-desc",
    });
    fetch(`/api/search?${params}`)
      .then((r) => r.json())
      .then((d) => setHotels(d.offers || []))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, [destination, compact]);

  if (loading) {
    return (
      <div className="mt-6 animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-6">
        <div className="h-5 w-48 rounded bg-gray-200" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!hotels.length) return null;

  const qs = new URLSearchParams({ type: "stays", q: destination });
  if (checkIn) qs.set("checkIn", checkIn);
  if (checkOut) qs.set("checkOut", checkOut);

  const handleSelect = (hotel: Offer) => {
    if (!onSelectHotel || !checkIn || !checkOut) return;
    if (selectedHotelId === hotel.id) {
      onSelectHotel(null);
      return;
    }
    onSelectHotel(bundleHotelFromOffer(hotel, checkIn, checkOut, guests, 1));
  };

  return (
    <section
      className={
        compact
          ? "mt-6 rounded-xl border border-[#2D83C2]/25 bg-gradient-to-br from-[#eef5fc] to-white p-4 sm:p-5"
          : "mt-10 rounded-2xl border border-[#2D83C2]/20 bg-gradient-to-br from-[#eef5fc] to-white p-5 sm:p-6"
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="text-[#2D83C2]" size={20} />
            <h2 className="text-lg font-bold text-[#1e2e5e]">
              {fmt(b.addHotelIn, { destination })}
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {fmt(b.savingsHint, { pct: BUNDLE_HOTEL_EXTRA_DISCOUNT_PCT })}
          </p>
        </div>
        <Link href={`/search?${qs.toString()}`} className="text-sm font-semibold text-[#2D83C2] hover:underline">
          {b.viewAllHotels} →
        </Link>
      </div>

      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {hotels.map((hotel) => {
          const total = checkIn && checkOut ? calcBundleHotelPrice(hotel, checkIn, checkOut, 1) : null;
          const selected = selectedHotelId === hotel.id;

          return (
            <div
              key={hotel.id}
              className={`flex overflow-hidden rounded-xl border bg-white transition ${
                selected ? "border-[#2D83C2] ring-2 ring-[#2D83C2]/20" : "border-gray-200 hover:border-[#2D83C2]/40"
              }`}
            >
              <div className="relative min-h-[88px] w-24 shrink-0 sm:w-28">
                <OfferImage
                  src={hotel.image}
                  alt={hotel.title}
                  metadata={hotel.metadata}
                  offerType={hotel.type}
                  city={hotel.city}
                  country={hotel.country}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col p-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-[#1e2e5e]">{hotel.title}</h3>
                {hotel.stars ? (
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                ) : null}
                {total != null && (
                  <p className="mt-auto pt-2 text-sm font-bold text-[#1e2e5e]">
                    {formatUsd(total)}
                    <span className="ml-1 text-[10px] font-normal text-gray-500">{b.forStay}</span>
                  </p>
                )}
                {onSelectHotel && checkIn && checkOut ? (
                  <button
                    type="button"
                    onClick={() => handleSelect(hotel)}
                    className={`mt-2 flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "bg-[#2D83C2] text-white"
                        : "bg-[#eef5fc] text-[#2D83C2] hover:bg-[#2D83C2] hover:text-white"
                    }`}
                  >
                    {selected ? (
                      <>
                        <Check size={14} /> {b.added}
                      </>
                    ) : (
                      b.addToTrip
                    )}
                  </button>
                ) : (
                  <Link
                    href={`/offers/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=1`}
                    className="mt-2 text-center text-xs font-semibold text-[#2D83C2] hover:underline"
                  >
                    {b.viewHotel}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
