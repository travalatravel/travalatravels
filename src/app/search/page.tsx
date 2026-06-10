"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import SearchForm from "@/components/SearchForm";
import OfferCard from "@/components/OfferCard";
import LiveFlightResultCard from "@/components/LiveFlightResultCard";
import FlightHotelBundle from "@/components/FlightHotelBundle";
import SearchFilters, { type SortOption } from "@/components/SearchFilters";
import type { Offer } from "@/lib/types";
import type { LiveFlightOffer } from "@/lib/live-flight-types";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { useTranslations } from "@/i18n/useTranslations";
import { cabinLabel } from "@/i18n/cabin-label";

const TYPE_MAP: Record<string, string> = {
  stays: "HOTEL",
  flights: "FLIGHT",
  "car-rental": "CAR_RENTAL",
  activities: "ACTIVITY",
};

function SearchResults() {
  const { messages: m, fmt } = useTranslations();
  const searchParams = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [liveFlights, setLiveFlights] = useState<LiveFlightOffer[]>([]);
  const [flightSource, setFlightSource] = useState<"market" | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState<SortOption>("recommended");
  const [flightError, setFlightError] = useState("");

  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "stays";
  const isFlights = type === "flights";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const fromCode = searchParams.get("fromCode") || "";
  const toCode = searchParams.get("toCode") || "";
  const depart = searchParams.get("depart") || "";
  const returnDate = searchParams.get("return") || "";
  const trip = (searchParams.get("trip") || "roundtrip") as TripType;
  const cabin = (searchParams.get("cabin") || "economy") as CabinClass;
  const adults = Math.max(1, parseInt(searchParams.get("adults") || "1", 10));
  const children = Math.max(0, parseInt(searchParams.get("children") || "0", 10));
  const infants = Math.max(0, parseInt(searchParams.get("infants") || "0", 10));
  const addHotel = searchParams.get("addHotel") === "1";

  const offerTypeKey = TYPE_MAP[type] as keyof typeof m.offerTypes;
  const typeLabel = m.offerTypes[offerTypeKey] || m.nav.stays;
  const canLiveSearch = isFlights && from && to && depart;

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

  const buildApiParams = (pageNum: number) => {
    const params = new URLSearchParams({ type, limit: "48", sort, page: String(pageNum) });
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return params;
  };

  const buildFlightApiParams = () => {
    const params = new URLSearchParams({
      from,
      to,
      depart,
      trip,
      cabin,
      adults: String(adults),
      children: String(children),
      infants: String(infants),
      sort: sort === "price-desc" ? "price-desc" : "price-asc",
    });
    if (fromCode) params.set("fromCode", fromCode);
    if (toCode) params.set("toCode", toCode);
    if (returnDate) params.set("return", returnDate);
    return params;
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setFlightError("");

    if (canLiveSearch) {
      fetch(`/api/flights/search?${buildFlightApiParams()}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) setFlightError(data.error);
          setLiveFlights(data.flights || []);
          setFlightSource(data.source || null);
          setTotal(data.total || 0);
          setPages(1);
          setOffers([]);
        })
        .finally(() => setLoading(false));
      return;
    }

    setLiveFlights([]);
    setFlightSource(null);

    if (isFlights) {
      setOffers([]);
      setTotal(0);
      setPages(1);
      setLoading(false);
      return;
    }

    fetch(`/api/search?${buildApiParams(1)}`)
      .then((r) => r.json())
      .then((data) => {
        setOffers(data.offers || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [q, type, sort, from, to, fromCode, toCode, depart, returnDate, trip, cabin, adults, children, infants, canLiveSearch, isFlights]);

  const loadMore = async () => {
    if (page >= pages || loadingMore || canLiveSearch) return;
    setLoadingMore(true);
    const next = page + 1;
    const data = await fetch(`/api/search?${buildApiParams(next)}`).then((r) => r.json());
    setOffers((prev) => [...prev, ...(data.offers || [])]);
    setPage(next);
    setLoadingMore(false);
  };

  const routeLabel =
    isFlights && (from || to)
      ? `${from || "Anywhere"} → ${to || "Anywhere"}`
      : null;

  const resultCount = canLiveSearch ? liveFlights.length : total;
  const hasResults = canLiveSearch ? liveFlights.length > 0 : offers.length > 0;

  return (
    <SiteChrome>
      <div className="bg-[#1e2e5e] py-5 sm:py-8">
        <div className="mx-auto max-w-5xl px-3 sm:px-4">
          <SearchForm defaultType={type} defaultQuery={q} compact />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-3 py-8 sm:px-4 sm:py-10 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#2577be]">{typeLabel}</p>
            <h1 className="text-2xl font-bold text-[#1e2e5e]">
              {loading
                ? m.common.searching
                : isFlights
                  ? fmt(m.common.flightCount, { count: resultCount.toLocaleString() })
                  : fmt(m.common.resultCount, { count: resultCount.toLocaleString() })}
              {routeLabel && <span className="font-normal text-gray-500"> · {routeLabel}</span>}
              {!isFlights && q && <span className="font-normal text-gray-500"> {fmt(m.common.forQuery, { query: q })}</span>}
            </h1>
            {isFlights && !loading && (
              <p className="mt-1 text-sm text-gray-500">
                {depart && `${m.common.depart} ${depart}`}
                {trip === "roundtrip" && returnDate && ` · ${m.common.return} ${returnDate}`}
                {" · "}
                {fmt(m.searchPage.forPassengers, { count: adults + children + infants })}
                {" · "}
                {cabinLabel(cabin, m)}
                {flightSource === "market" && (
                  <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    {m.common.bestRatesOff}
                  </span>
                )}
              </p>
            )}
          </div>
          {!loading && hasResults && (
            <span className="rounded-full bg-[#2dd4bf]/20 px-3 py-1 text-xs font-semibold text-[#1e2e5e]">
              {m.common.bestPriceGuarantee}
            </span>
          )}
        </div>

        {!loading && hasResults && (
          <div className="mt-6">
            <SearchFilters sort={sort} onSortChange={setSort} total={resultCount} />
          </div>
        )}

        {loading ? (
          <div className={`mt-8 ${isFlights ? "space-y-2" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {Array.from({ length: isFlights ? 5 : 6 }).map((_, i) => (
              <div
                key={i}
                className={`animate-pulse bg-gray-100 ${isFlights ? "h-36 border border-gray-200" : "h-72 rounded-2xl"}`}
              />
            ))}
          </div>
        ) : !hasResults ? (
          <div className="mt-12 text-center">
            <p className="text-gray-500">
              {flightError ||
                (isFlights && !canLiveSearch
                  ? m.searchPage.enterRoute
                  : isFlights
                    ? m.searchPage.noFlightsFound
                    : m.searchPage.noResultsFound)}
            </p>
            {canLiveSearch || !isFlights ? (
              <p className="mt-2 text-sm text-gray-400">
                {isFlights ? m.searchPage.tryFlights : m.searchPage.tryStays}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <div className={`mt-8 ${isFlights ? "space-y-2" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {canLiveSearch
                ? liveFlights.map((flight) => (
                    <LiveFlightResultCard key={flight.id} flight={flight} searchContext={flightSearchContext} />
                  ))
                : offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
            </div>
            {!canLiveSearch && page < pages && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-lg bg-[#2577be] px-8 py-3 text-sm font-semibold text-white hover:bg-[#1e2e5e] disabled:opacity-60"
                >
                  {loadingMore ? m.common.loading : fmt(m.searchPage.loadMore, { shown: offers.length, total })}
                </button>
              </div>
            )}
            {isFlights && addHotel && to && (
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">…</div>}>
      <SearchResults />
    </Suspense>
  );
}
