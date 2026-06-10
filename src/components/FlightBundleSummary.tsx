"use client";

import { Plane, Building2 } from "lucide-react";
import { formatUsd } from "@/lib/pricing";
import type { FlightTokenPayload } from "@/lib/flight-token";
import type { BundleHotelSelection } from "@/lib/flight-hotel-bundle";
import { normalizeFlightPayload, flightRouteLabel } from "@/lib/flight-route";
import { useTranslations } from "@/i18n/useTranslations";

export default function FlightBundleSummary({
  flight,
  flightTotal,
  hotel,
}: {
  flight: FlightTokenPayload;
  flightTotal: number;
  hotel?: BundleHotelSelection | null;
}) {
  const { messages: m } = useTranslations();
  const b = m.bundle;
  const f = normalizeFlightPayload(flight);
  const route = flightRouteLabel(f);
  const bundleTotal = flightTotal + (hotel?.hotelTotal ?? 0);
  const departDate = f.departAt ? f.departAt.slice(0, 10) : "";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-[#1e2e5e] px-5 py-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
          {hotel ? b.flightPlusHotel : m.common.flightLabel}
        </p>
        <p className="mt-1 text-2xl font-bold">{formatUsd(bundleTotal)}</p>
        {hotel && (
          <p className="mt-1 text-xs text-white/80">{b.bundleSavings}</p>
        )}
      </div>

      <div className="space-y-3 p-5 text-sm">
        <div className="flex items-start gap-3">
          <Plane size={16} className="mt-0.5 shrink-0 text-[#2D83C2]" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#1e2e5e]">{f.airline}</p>
            {route && <p className="text-xs text-gray-500">{route}</p>}
            {departDate && <p className="mt-1 text-xs text-gray-400">{departDate}</p>}
          </div>
          <p className="font-semibold text-[#1e2e5e]">{formatUsd(flightTotal)}</p>
        </div>

        {hotel && (
          <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
            <Building2 size={16} className="mt-0.5 shrink-0 text-[#2D83C2]" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#1e2e5e] line-clamp-2">{hotel.title}</p>
              <p className="text-xs text-gray-500">
                {hotel.checkIn} → {hotel.checkOut} · {hotel.nights} {b.nights}
              </p>
            </div>
            <p className="font-semibold text-[#1e2e5e]">{formatUsd(hotel.hotelTotal)}</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="font-semibold text-[#1e2e5e]">{m.common.total}</span>
          <span className="text-xl font-bold text-[#1e2e5e]">{formatUsd(bundleTotal)}</span>
        </div>
        <p className="text-[10px] text-gray-400">{m.common.taxesIncluded}</p>
      </div>
    </div>
  );
}
