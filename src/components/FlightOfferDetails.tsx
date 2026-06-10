"use client";

import { Briefcase, Clock, Luggage, Plane, Shield } from "lucide-react";
import type { FlightMetadata } from "@/lib/flight-types";
import type { CabinClass } from "@/lib/flight-types";
import { flightTimesForOffer, stopsForOffer } from "@/lib/flight-display";
import { useTranslations } from "@/i18n/useTranslations";
import { cabinClassLabel } from "@/i18n/display-labels";

export default function FlightOfferDetails({
  offerId,
  meta,
  cabin,
  trip,
  depart,
  returnDate,
}: {
  offerId: string;
  meta: FlightMetadata;
  cabin: CabinClass;
  trip: string;
  depart?: string;
  returnDate?: string;
}) {
  const { messages: m, fmt } = useTranslations();
  const times = flightTimesForOffer(offerId, meta.duration || "3h 0m");
  const stops = meta.stops ?? stopsForOffer(offerId);

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-bold text-[#1a1a1a]">{m.common.flightItinerary}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef5fc]">
              <Plane size={18} className="text-[#2D83C2]" />
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a]">{meta.airline}</p>
              <p className="text-sm text-gray-500">{meta.from} → {meta.to}</p>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-2xl font-bold text-[#1a1a1a]">{times.depart}</span>
            <span className="mx-2 text-gray-300">→</span>
            <span className="text-2xl font-bold text-[#1a1a1a]">{times.arrive}</span>
            <p className="mt-1 text-xs text-gray-500">
              {meta.duration} · {stops === 0 ? m.common.direct : fmt(m.common.stopsCount, { count: stops })}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">{m.common.economyFareHint}</p>
        {depart && (
          <p className="mt-2 text-sm text-gray-600">
            <strong>{m.common.depart}:</strong> {depart}
            {trip === "roundtrip" && returnDate && (
              <>
                {" · "}
                <strong>{m.common.returnFlight}:</strong> {returnDate}
              </>
            )}
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Luggage, title: m.common.baggage, text: m.common.baggageText },
          { icon: Briefcase, title: m.common.cabin, text: cabinClassLabel(m, cabin) },
          { icon: Clock, title: m.common.duration, text: meta.duration || m.common.seeAirline },
          { icon: Shield, title: m.common.flexibility, text: m.common.flexibilityText },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <item.icon size={18} className="text-[#2D83C2]" />
            <p className="mt-2 text-sm font-semibold text-[#1a1a1a]">{item.title}</p>
            <p className="mt-1 text-xs text-gray-500">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
