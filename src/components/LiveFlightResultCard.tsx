"use client";

import Link from "next/link";
import { Plane, Clock, Luggage } from "lucide-react";
import type { LiveFlightOffer } from "@/lib/live-flight-types";
import { CABIN_LABELS } from "@/lib/flight-types";
import { getFlightPricing } from "@/lib/flight-pricing";
import { formatUsd } from "@/lib/pricing";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "--:--";
  }
}

export default function LiveFlightResultCard({ flight }: { flight: LiveFlightOffer }) {
  const pricing = getFlightPricing(flight.sourcePrice);

  return (
    <Link
      href={`/flights/offer?token=${encodeURIComponent(flight.offerToken)}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-[#2577be]/40 hover:shadow-md"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef5fc] text-[#2577be]">
            <Plane size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-[#1e2e5e]">{flight.airline}</p>
              <span className="rounded bg-[#2dd4bf]/25 px-1.5 py-0.5 text-[10px] font-bold text-[#1e2e5e]">
                -{pricing.discountPct}%
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              {flight.fromCode || flight.from} → {flight.toCode || flight.to}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-lg font-bold text-[#1e2e5e]">{formatTime(flight.departAt)}</span>
                <span className="mx-2 text-gray-300">→</span>
                <span className="text-lg font-bold text-[#1e2e5e]">{formatTime(flight.arriveAt)}</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {flight.duration}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <Luggage size={11} /> 1 carry-on included
              </span>
              <span>{CABIN_LABELS[flight.cabin]}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-gray-100 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <div className="text-right">
            <p className="text-2xl font-bold text-[#1e2e5e]">{formatUsd(pricing.salePrice)}</p>
            <p className="text-xs text-gray-400 line-through">{formatUsd(pricing.originalPrice)}</p>
            <p className="text-[10px] text-[#2577be]">Save {formatUsd(pricing.savings)}</p>
          </div>
          <span className="rounded-lg bg-[#2577be] px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#1e2e5e]">
            Select
          </span>
        </div>
      </div>
    </Link>
  );
}
