"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Luggage } from "lucide-react";
import type { FlightLeg, LiveFlightOffer } from "@/lib/live-flight-types";
import { getFlightPricing } from "@/lib/flight-pricing";
import { buildFlightOfferHref, type FlightOfferSearchContext } from "@/lib/flight-offer-link";
import { combineRoundtripTokens } from "@/lib/flight-combine";
import { saveOutboundToken, readOutboundToken } from "@/lib/flight-selection-storage";
import { tokenFromOffer } from "@/lib/flight-token";
import { formatUsd } from "@/lib/pricing";
import { useTranslations } from "@/i18n/useTranslations";
import { LOCALE_BCP47 } from "@/i18n/config";
import { cabinClassLabel } from "@/i18n/display-labels";

function formatTime(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "--:--";
  }
}

function formatLegDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function airlineLogoUrl(code: string) {
  return `https://images.kiwi.com/airlines/64/${code}.png`;
}

function resolveOutbound(flight: LiveFlightOffer): FlightLeg {
  if (flight.outbound) return flight.outbound;
  return {
    airline: flight.airline,
    airlineCode: flight.airlineCode,
    from: flight.from,
    to: flight.to,
    fromCode: flight.fromCode,
    toCode: flight.toCode,
    departAt: flight.departAt,
    arriveAt: flight.arriveAt,
    duration: flight.duration,
    stops: flight.stops,
  };
}

function resolveReturn(flight: LiveFlightOffer): FlightLeg | null {
  if (flight.returnLeg) return flight.returnLeg;
  return null;
}

function stopsLabel(stops: number, direct: string, stop: string, stopsPlural: string) {
  if (stops === 0) return direct;
  if (stops === 1) return `1 ${stop}`;
  return `${stops} ${stopsPlural}`;
}

function FlightLegRow({
  label,
  leg,
  direct,
  stop,
  stopsPlural,
  dateLocale,
}: {
  label: string;
  leg: FlightLeg;
  direct: string;
  stop: string;
  stopsPlural: string;
  dateLocale: string;
}) {
  return (
    <div className="flex gap-3 border-t border-gray-100 py-3 first:border-t-0 first:pt-0 sm:gap-4">
      <div className="hidden w-12 shrink-0 sm:block">
        <img
          src={airlineLogoUrl(leg.airlineCode)}
          alt={leg.airline}
          width={48}
          height={48}
          className="h-10 w-10 rounded object-contain"
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = "none";
            const fallback = img.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        <div
          className="hidden h-10 w-10 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-600"
          style={{ display: "none" }}
        >
          {leg.airlineCode}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#2D83C2]">{label}</span>
          <span className="text-[10px] text-gray-400">·</span>
          <span className="text-[10px] font-medium text-gray-500">{formatLegDate(leg.departAt, dateLocale)}</span>
          <span className="text-[10px] text-gray-400 sm:hidden">·</span>
          <span className="text-[10px] font-medium text-gray-600 sm:hidden">{leg.airline}</span>
        </div>

        <div className="mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3">
          <div className="text-center sm:text-left">
            <p className="text-base font-bold text-[#1a1a1a] sm:text-lg">{formatTime(leg.departAt, dateLocale)}</p>
            <p className="text-[10px] font-semibold text-gray-500 sm:text-xs">{leg.fromCode}</p>
          </div>

          <div className="flex min-w-0 flex-col items-center px-1">
            <p className="text-[10px] font-medium text-gray-500">{leg.duration}</p>
            <div className="relative mt-1 flex w-full max-w-[140px] items-center sm:max-w-[180px]">
              <div className="h-px flex-1 bg-gray-300" />
              <div className="mx-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
              <div className="h-px flex-1 bg-gray-300" />
            </div>
            <p className="mt-1 text-[10px] font-semibold text-gray-500">
              {stopsLabel(leg.stops, direct, stop, stopsPlural)}
            </p>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-base font-bold text-[#1a1a1a] sm:text-lg">{formatTime(leg.arriveAt, dateLocale)}</p>
            <p className="text-[10px] font-semibold text-gray-500 sm:text-xs">{leg.toCode}</p>
          </div>
        </div>

        <p className="mt-1 hidden text-xs text-gray-500 sm:block">
          {leg.airline}
          {leg.flightNumber ? ` · ${leg.flightNumber}` : ""}
        </p>
      </div>
    </div>
  );
}

export type FlightSelectionLeg = "outbound" | "return" | null;

export default function LiveFlightResultCard({
  flight,
  searchContext,
  selectionLeg = null,
  outboundToken,
}: {
  flight: LiveFlightOffer;
  searchContext: FlightOfferSearchContext;
  selectionLeg?: FlightSelectionLeg;
  outboundToken?: string;
}) {
  const router = useRouter();
  const { locale, messages: m } = useTranslations();
  const dateLocale = LOCALE_BCP47[locale];
  const pricing = getFlightPricing(flight.sourcePrice);
  const outbound = resolveOutbound(flight);
  const returnLeg = resolveReturn(flight);
  const c = m.common;

  const displayLeg =
    selectionLeg === "return" && returnLeg
      ? returnLeg
      : selectionLeg === "return"
        ? outbound
        : outbound;

  const legLabel =
    selectionLeg === "return" ? c.returnFlight : selectionLeg === "outbound" ? c.departure : c.departure;

  const href = buildFlightOfferHref(flight, searchContext);

  const pax = {
    adults: searchContext.adults,
    children: searchContext.children,
    infants: searchContext.infants,
  };

  const resolveToken = (offer: LiveFlightOffer) =>
    offer.offerToken || tokenFromOffer(offer, pax);

  const handleSelect = () => {
    if (selectionLeg === "outbound") {
      const token = resolveToken(flight);
      if (!token) return;
      saveOutboundToken(token);
      const params = new URLSearchParams(window.location.search);
      params.delete("outboundToken");
      params.set("pickReturn", "1");
      router.push(`/search?${params.toString()}`);
      return;
    }
    if (selectionLeg === "return") {
      const outTok = outboundToken || readOutboundToken();
      if (!outTok) return;
      const returnTok = resolveToken(flight);
      if (!returnTok) return;
      const combined = combineRoundtripTokens(outTok, returnTok);
      if (!combined) return;
      const params = new URLSearchParams({
        token: combined,
        from: searchContext.from,
        to: searchContext.to,
        fromCode: searchContext.fromCode || outbound.fromCode,
        toCode: searchContext.toCode || outbound.toCode,
        depart: searchContext.depart,
        trip: "roundtrip",
        cabin: searchContext.cabin,
        adults: String(searchContext.adults),
        children: String(searchContext.children),
        infants: String(searchContext.infants),
      });
      if (searchContext.returnDate) params.set("return", searchContext.returnDate);
      if (searchContext.addHotel) params.set("addHotel", "1");
      router.push(`/flights/offer?${params.toString()}`);
    }
  };

  const cardBody = (
    <div className="flex flex-col lg:flex-row">
      <div className="min-w-0 flex-1 px-4 py-3 sm:px-5 sm:py-4">
        <FlightLegRow
          label={legLabel}
          leg={displayLeg}
          direct={c.direct}
          stop={c.stop}
          stopsPlural={c.stops}
          dateLocale={dateLocale}
        />
        {!selectionLeg && returnLeg && (
          <FlightLegRow
            label={c.returnFlight}
            leg={returnLeg}
            direct={c.direct}
            stop={c.stop}
            stopsPlural={c.stops}
            dateLocale={dateLocale}
          />
        )}
        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <Luggage size={11} /> {c.carryOnIncluded}
          </span>
          <span>{cabinClassLabel(m, flight.cabin)}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-gray-100 bg-[#f8fafc] px-4 py-3 sm:px-5 lg:w-52 lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:py-4">
        <div className="text-left lg:text-right">
          <p className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">{formatUsd(pricing.salePrice)}</p>
          <p className="text-xs text-gray-400 line-through">{formatUsd(pricing.originalPrice)}</p>
          <p className="text-[10px] font-semibold text-emerald-600">-{pricing.discountPct}%</p>
        </div>
        <span className="rounded-lg bg-[#2D83C2] px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#1a5f94]">
          {selectionLeg ? c.select : c.select}
        </span>
      </div>
    </div>
  );

  if (selectionLeg) {
    return (
      <button
        type="button"
        onClick={handleSelect}
        className="group block w-full border border-gray-200 bg-white text-left transition hover:border-[#2D83C2]/50 hover:shadow-sm"
      >
        {cardBody}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="group block border border-gray-200 bg-white transition hover:border-[#2D83C2]/50 hover:shadow-sm"
    >
      {cardBody}
    </Link>
  );
}
