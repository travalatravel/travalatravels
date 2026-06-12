"use client";

import { useEffect, useState } from "react";
import { Check, Plane } from "lucide-react";
import { resolveIataCode } from "@/lib/iata-codes";
import { findKnownAirport } from "@/lib/sky-scrapper-airports";
import { getFlightPricing } from "@/lib/flight-pricing";
import { tokenFromOffer } from "@/lib/flight-token";
import { formatUsd } from "@/lib/pricing";
import type { LiveFlightOffer } from "@/lib/live-flight-types";
import type { BundleFlightSelection } from "@/lib/flight-hotel-bundle";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { useTranslations } from "@/i18n/useTranslations";
import { LOCALE_BCP47 } from "@/i18n/config";

function formatTime(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "--:--";
  }
}

export default function HotelFlightBundle({
  destinationCity,
  destinationCountry,
  checkIn,
  checkOut,
  guests = 2,
  selectedFlightToken,
  onSelectFlight,
  compact = false,
}: {
  destinationCity: string;
  destinationCountry?: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  selectedFlightToken?: string | null;
  onSelectFlight?: (bundle: BundleFlightSelection | null) => void;
  compact?: boolean;
}) {
  const { locale, messages: m, fmt } = useTranslations();
  const b = m.bundle;
  const dateLocale = LOCALE_BCP47[locale];
  const [origin, setOrigin] = useState("Berlin");
  const [flights, setFlights] = useState<LiveFlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toCode = resolveIataCode(destinationCity) || resolveIataCode(destinationCountry || "");
  const trip: TripType = "roundtrip";
  const cabin: CabinClass = "economy";

  useEffect(() => {
    if (!checkIn || !checkOut || !destinationCity.trim() || !origin.trim()) {
      setFlights([]);
      return;
    }

    const fromCode = resolveIataCode(origin) || "";
    const fromSky = findKnownAirport(origin, fromCode) ?? undefined;
    const toSky = findKnownAirport(destinationCity, toCode || "") ?? undefined;

    if (!fromCode && !fromSky) {
      setFlights([]);
      setError(b.flightOriginHint);
      return;
    }
    if (!toCode && !toSky) {
      setFlights([]);
      setError(fmt(b.flightDestinationUnknown, { city: destinationCity }));
      return;
    }

    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      from: origin,
      to: destinationCity,
      depart: checkIn,
      return: checkOut,
      trip,
      cabin,
      adults: String(Math.max(1, guests)),
      sort: "price-asc",
    });
    if (fromCode) params.set("fromCode", fromCode);
    if (toCode) params.set("toCode", toCode);
    if (fromSky) {
      params.set("fromSkyId", fromSky.skyId);
      params.set("fromEntityId", fromSky.entityId);
    }
    if (toSky) {
      params.set("toSkyId", toSky.skyId);
      params.set("toEntityId", toSky.entityId);
    }

    fetch(`/api/flights/search?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setFlights((d.flights || []).slice(0, compact ? 3 : 4));
        if (!d.flights?.length) setError(b.noFlightsFound);
      })
      .catch(() => {
        setFlights([]);
        setError(b.noFlightsFound);
      })
      .finally(() => setLoading(false));
  }, [origin, destinationCity, destinationCountry, checkIn, checkOut, guests, toCode, compact, b, fmt]);

  const handleSelect = (flight: LiveFlightOffer) => {
    if (!onSelectFlight) return;
    const pax = { adults: Math.max(1, guests), children: 0, infants: 0 };
    const token = flight.offerToken || tokenFromOffer(flight, pax);
    if (selectedFlightToken === token) {
      onSelectFlight(null);
      return;
    }
    onSelectFlight({
      token,
      flightTotal: getFlightPricing(flight.sourcePrice).salePrice,
      route: `${flight.from} → ${flight.to}`,
      airline: flight.airline,
      departAt: flight.departAt.slice(0, 10),
      cabin: flight.cabin,
      trip: flight.trip,
    });
  };

  if (!checkIn || !checkOut) return null;

  return (
    <section
      className={
        compact
          ? "mt-6 rounded-xl border border-[#2D83C2]/25 bg-gradient-to-br from-[#eef5fc] to-white p-4 sm:p-5"
          : "mt-8 rounded-2xl border border-[#2D83C2]/20 bg-gradient-to-br from-[#eef5fc] to-white p-5 sm:p-6"
      }
    >
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Plane className="text-[#2D83C2]" size={20} />
          <h2 className="text-lg font-bold text-[#1a1a1a]">
            {fmt(b.addFlightTo, { destination: destinationCity })}
          </h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">{b.addFlightOptional}</p>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500">{b.flyingFrom}</label>
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder={b.flyingFromPlaceholder}
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2D83C2]"
        />
        {error && <p className="mt-1 text-xs text-amber-700">{error}</p>}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : flights.length > 0 ? (
        <div className="space-y-3">
          {flights.map((flight) => {
            const pax = { adults: Math.max(1, guests), children: 0, infants: 0 };
            const token = flight.offerToken || tokenFromOffer(flight, pax);
            const selected = selectedFlightToken === token;
            const pricing = getFlightPricing(flight.sourcePrice);
            const leg = flight.outbound || flight;

            return (
              <div
                key={flight.id}
                className={`flex flex-col gap-3 rounded-xl border bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 ${
                  selected ? "border-[#2D83C2] ring-2 ring-[#2D83C2]/20" : "border-gray-200"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#1a1a1a]">{flight.airline}</p>
                  <p className="text-xs text-gray-500">
                    {leg.fromCode} → {leg.toCode} · {formatTime(leg.departAt, dateLocale)} –{" "}
                    {formatTime(leg.arriveAt, dateLocale)}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{formatUsd(pricing.salePrice)}</p>
                </div>
                {onSelectFlight ? (
                  <button
                    type="button"
                    onClick={() => handleSelect(flight)}
                    className={`flex items-center justify-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold transition ${
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
                      b.addFlightToTrip
                    )}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : !error ? (
        <p className="text-sm text-gray-500">{b.noFlightsFound}</p>
      ) : null}
    </section>
  );
}
