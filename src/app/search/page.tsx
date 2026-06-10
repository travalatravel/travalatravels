"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { decodeFlightToken } from "@/lib/flight-token";
import { LOCALE_BCP47 } from "@/i18n/config";
import SiteChrome from "@/components/SiteChrome";
import SearchForm from "@/components/SearchForm";
import StaysSearchResults from "@/components/StaysSearchResults";
import LiveFlightResultCard from "@/components/LiveFlightResultCard";
import FlightHotelBundle from "@/components/FlightHotelBundle";
import SearchFilters, { type SortOption } from "@/components/SearchFilters";
import type { LiveFlightOffer } from "@/lib/live-flight-types";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { useTranslations } from "@/i18n/useTranslations";
import { cabinLabel } from "@/i18n/cabin-label";

function sortFlights(flights: LiveFlightOffer[], sort: SortOption): LiveFlightOffer[] {
  if (sort === "recommended") return flights;
  const sorted = [...flights];
  if (sort === "price-desc") {
    sorted.sort((a, b) => b.salePrice - a.salePrice);
  } else if (sort === "price-asc") {
    sorted.sort((a, b) => a.salePrice - b.salePrice);
  }
  return sorted;
}

function formatLegTime(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "--:--";
  }
}

function FlightSearchResults() {
  const { locale, messages: m, fmt } = useTranslations();
  const dateLocale = LOCALE_BCP47[locale];
  const searchParams = useSearchParams();
  const [liveFlights, setLiveFlights] = useState<LiveFlightOffer[]>([]);
  const [flightSource, setFlightSource] = useState<"sky-scrapper" | "market" | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("recommended");
  const [flightError, setFlightError] = useState("");

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const fromCode = searchParams.get("fromCode") || "";
  const toCode = searchParams.get("toCode") || "";
  const fromSkyId = searchParams.get("fromSkyId") || "";
  const fromEntityId = searchParams.get("fromEntityId") || "";
  const toSkyId = searchParams.get("toSkyId") || "";
  const toEntityId = searchParams.get("toEntityId") || "";
  const depart = searchParams.get("depart") || "";
  const returnDate = searchParams.get("return") || "";
  const trip = (searchParams.get("trip") || "roundtrip") as TripType;
  const cabin = (searchParams.get("cabin") || "economy") as CabinClass;
  const adults = Math.max(1, parseInt(searchParams.get("adults") || "1", 10));
  const children = Math.max(0, parseInt(searchParams.get("children") || "0", 10));
  const infants = Math.max(0, parseInt(searchParams.get("infants") || "0", 10));
  const addHotel = searchParams.get("addHotel") === "1";
  const outboundToken = searchParams.get("outboundToken") || "";
  const isRoundtripSelect = trip === "roundtrip" && Boolean(returnDate);
  const selectionLeg = !isRoundtripSelect
    ? null
    : !outboundToken
      ? ("outbound" as const)
      : ("return" as const);
  const selectedOutbound = outboundToken ? decodeFlightToken(outboundToken) : null;

  const canLiveSearch = Boolean(from && to && depart);

  const flightSearchContext = {
    from,
    to,
    fromCode,
    toCode,
    depart,
    returnDate,
    trip,
    cabin,
    adults,
    children,
    infants,
    addHotel,
  };

  useEffect(() => {
    setLoading(true);
    setFlightError("");

    if (!canLiveSearch) {
      setLiveFlights([]);
      setFlightSource(null);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      from,
      to,
      depart,
      trip,
      cabin,
      adults: String(adults),
      children: String(children),
      infants: String(infants),
    });
    if (fromCode) params.set("fromCode", fromCode);
    if (toCode) params.set("toCode", toCode);
    if (fromSkyId) params.set("fromSkyId", fromSkyId);
    if (fromEntityId) params.set("fromEntityId", fromEntityId);
    if (toSkyId) params.set("toSkyId", toSkyId);
    if (toEntityId) params.set("toEntityId", toEntityId);
    if (returnDate) params.set("return", returnDate);
    if (selectionLeg === "outbound") params.set("leg", "outbound");
    if (selectionLeg === "return") params.set("leg", "return");

    fetch(`/api/flights/search?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setFlightError(data.error);
        setLiveFlights(data.flights || []);
        setFlightSource(data.source || null);
      })
      .catch(() => {
        setLiveFlights([]);
        setFlightError(m.searchPage.noFlightsFound);
      })
      .finally(() => setLoading(false));
  }, [
    canLiveSearch,
    from,
    to,
    fromCode,
    toCode,
    fromSkyId,
    fromEntityId,
    toSkyId,
    toEntityId,
    depart,
    returnDate,
    trip,
    cabin,
    adults,
    children,
    infants,
    selectionLeg,
    m.searchPage.noFlightsFound,
  ]);

  const sortedFlights = useMemo(() => sortFlights(liveFlights, sort), [liveFlights, sort]);

  const routeLabel = from || to ? `${from || m.common.anywhere} → ${to || m.common.anywhere}` : null;
  const hasResults = sortedFlights.length > 0;

  return (
    <SiteChrome>
      <div className="bg-[#1a5f94] py-5 sm:py-8">
        <div className="mx-auto max-w-5xl px-3 sm:px-4">
          <SearchForm defaultType="flights" compact syncFromUrl />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-3 py-8 sm:px-4 sm:py-10 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#2D83C2]">{m.offerTypes.FLIGHT}</p>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              {loading
                ? m.common.searching
                : fmt(m.common.flightCount, { count: sortedFlights.length.toLocaleString() })}
              {routeLabel && <span className="font-normal text-gray-500"> · {routeLabel}</span>}
            </h1>
            {!loading && (
              <p className="mt-1 text-sm text-gray-500">
                {depart && `${m.common.depart} ${depart}`}
                {trip === "roundtrip" && returnDate && ` · ${m.common.return} ${returnDate}`}
                {" · "}
                {fmt(m.searchPage.forPassengers, { count: adults + children + infants })}
                {" · "}
                {cabinLabel(cabin, m)}
                {flightSource === "sky-scrapper" && (
                  <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                    {m.common.liveRatesOff}
                  </span>
                )}
                {flightSource === "market" && (
                  <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    {m.common.estimatedRates}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {selectionLeg === "return" && selectedOutbound && (
          <div className="mt-6 rounded-xl border border-[#2D83C2]/30 bg-[#eef5fc] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#2D83C2]">
                  {m.searchPage.selectedOutbound}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#1a1a1a]">
                  {selectedOutbound.outbound?.fromCode || selectedOutbound.fromCode} →{" "}
                  {selectedOutbound.outbound?.toCode || selectedOutbound.toCode}
                  {" · "}
                  {formatLegTime(
                    selectedOutbound.outbound?.departAt || selectedOutbound.departAt,
                    dateLocale,
                  )}
                  {" – "}
                  {formatLegTime(
                    selectedOutbound.outbound?.arriveAt || selectedOutbound.arriveAt,
                    dateLocale,
                  )}
                </p>
                <p className="text-xs text-gray-500">{selectedOutbound.outbound?.airline || selectedOutbound.airline}</p>
              </div>
              <Link
                href={(() => {
                  const p = new URLSearchParams(searchParams.toString());
                  p.delete("outboundToken");
                  return `/search?${p.toString()}`;
                })()}
                className="text-sm font-medium text-[#2D83C2] hover:underline"
              >
                {m.searchPage.changeOutbound}
              </Link>
            </div>
          </div>
        )}

        {!loading && hasResults && (
          <div className="mt-6">
            <SearchFilters sort={sort} onSortChange={setSort} total={sortedFlights.length} />
          </div>
        )}

        {loading ? (
          <div className="mt-8 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse border border-gray-200 bg-gray-100" />
            ))}
          </div>
        ) : !hasResults ? (
          <div className="mt-12 text-center">
            <p className="text-gray-500">
              {flightError || (!canLiveSearch ? m.searchPage.enterRoute : m.searchPage.noFlightsFound)}
            </p>
            <p className="mt-2 text-sm text-gray-400">{m.searchPage.tryFlights}</p>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-2">
              {sortedFlights.map((flight) => (
                <LiveFlightResultCard
                  key={flight.id}
                  flight={flight}
                  searchContext={flightSearchContext}
                  selectionLeg={selectionLeg}
                  outboundToken={outboundToken || undefined}
                />
              ))}
            </div>
            {addHotel && to && (
              <FlightHotelBundle
                destination={to}
                depart={depart}
                returnDate={returnDate || depart}
                guests={adults + children + infants}
              />
            )}
          </>
        )}
      </main>
    </SiteChrome>
  );
}

function SearchRouter() {
  const type = useSearchParams().get("type") || "stays";
  if (type !== "flights") {
    return <StaysSearchResults />;
  }
  return <FlightSearchResults />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">…</div>}>
      <SearchRouter />
    </Suspense>
  );
}
