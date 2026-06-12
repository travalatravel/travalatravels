"use client";

import { Building2, Plane } from "lucide-react";
import { formatUsd } from "@/lib/pricing";
import type { Offer } from "@/lib/types";
import type { BundleFlightSelection } from "@/lib/flight-hotel-bundle";
import { useTranslations } from "@/i18n/useTranslations";

export default function HotelBundleSummary({
  offer,
  hotelTotal,
  checkIn,
  checkOut,
  nights,
  flight,
}: {
  offer: Offer;
  hotelTotal: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  flight?: BundleFlightSelection | null;
}) {
  const { messages: m } = useTranslations();
  const b = m.bundle;
  const bundleTotal = hotelTotal + (flight?.flightTotal ?? 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-[#1a5f94] px-5 py-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
          {flight ? b.hotelPlusFlight : m.offerTypes.HOTEL}
        </p>
        <p className="mt-1 text-2xl font-bold">{formatUsd(bundleTotal)}</p>
        {flight && <p className="mt-1 text-xs text-white/80">{b.bundleSavings}</p>}
      </div>

      <div className="space-y-3 p-5 text-sm">
        <div className="flex items-start gap-3">
          <Building2 size={16} className="mt-0.5 shrink-0 text-[#2D83C2]" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#1a1a1a] line-clamp-2">{offer.title}</p>
            <p className="text-xs text-gray-500">
              {checkIn} → {checkOut} · {nights} {b.nights}
            </p>
          </div>
          <p className="font-semibold text-[#1a1a1a]">{formatUsd(hotelTotal)}</p>
        </div>

        {flight && (
          <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
            <Plane size={16} className="mt-0.5 shrink-0 text-[#2D83C2]" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#1a1a1a]">{flight.airline}</p>
              <p className="text-xs text-gray-500">{flight.route}</p>
            </div>
            <p className="font-semibold text-[#1a1a1a]">{formatUsd(flight.flightTotal)}</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="font-semibold text-[#1a1a1a]">{m.common.total}</span>
          <span className="text-xl font-bold text-[#1a1a1a]">{formatUsd(bundleTotal)}</span>
        </div>
        <p className="text-[10px] text-gray-400">{m.common.taxesIncluded}</p>
      </div>
    </div>
  );
}
