"use client";

import Link from "next/link";
import { Plane, Clock, Luggage } from "lucide-react";
import type { Offer } from "@/lib/types";
import {
  flightTimesForOffer,
  parseFlightMetadata,
  priceForFlight,
  stopsForOffer,
} from "@/lib/flight-display";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { CABIN_LABELS } from "@/lib/flight-types";
import { getOfferPricing, formatUsd } from "@/lib/pricing";

export default function FlightResultCard({
  offer,
  searchParams,
}: {
  offer: Offer;
  searchParams: {
    cabin?: string;
    trip?: string;
    adults?: number;
    children?: number;
    infants?: number;
    depart?: string;
    return?: string;
  };
}) {
  const meta = parseFlightMetadata(offer.metadata);
  const times = flightTimesForOffer(offer.id, meta.duration || "3h 0m");
  const stops = meta.stops ?? stopsForOffer(offer.id);
  const pax = (searchParams.adults || 1) + (searchParams.children || 0) + (searchParams.infants || 0);
  const total = priceForFlight(
    offer.price,
    (searchParams.cabin as CabinClass) || "economy",
    pax,
    (searchParams.trip as TripType) || "roundtrip",
  );
  const pricing = getOfferPricing(total, offer.id, null);

  const detailQs = new URLSearchParams();
  if (searchParams.depart) detailQs.set("depart", searchParams.depart);
  if (searchParams.return) detailQs.set("return", searchParams.return);
  detailQs.set("adults", String(searchParams.adults || 1));
  detailQs.set("children", String(searchParams.children || 0));
  detailQs.set("infants", String(searchParams.infants || 0));
  detailQs.set("cabin", searchParams.cabin || "economy");
  detailQs.set("trip", searchParams.trip || "roundtrip");

  return (
    <Link
      href={`/offers/${offer.id}?${detailQs.toString()}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-[#2D83C2]/40 hover:shadow-md"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef5fc] text-[#2D83C2]">
            <Plane size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#1e2e5e]">{meta.airline || "Airline"}</p>
            <p className="mt-0.5 text-xs text-gray-500">
              {meta.from || offer.city} → {meta.to || "Destination"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-lg font-bold text-[#1e2e5e]">{times.depart}</span>
                <span className="mx-2 text-gray-300">→</span>
                <span className="text-lg font-bold text-[#1e2e5e]">{times.arrive}</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {meta.duration || "—"}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <Luggage size={11} /> 1 carry-on included
              </span>
              <span>{CABIN_LABELS[(searchParams.cabin as CabinClass) || "economy"]}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-gray-100 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <div className="text-right">
            <p className="text-2xl font-bold text-[#1e2e5e]">{formatUsd(pricing.salePrice)}</p>
            {pricing.originalPrice > pricing.salePrice && (
              <p className="text-xs text-gray-400 line-through">{formatUsd(pricing.originalPrice)}</p>
            )}
            <p className="text-[10px] text-gray-500">total for {pax} passenger{pax !== 1 ? "s" : ""}</p>
          </div>
          <span className="rounded-lg bg-[#2D83C2] px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#1e2e5e]">
            Select
          </span>
        </div>
      </div>
    </Link>
  );
}
