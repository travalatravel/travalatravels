"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import SearchForm from "@/components/SearchForm";
import OfferCard from "@/components/OfferCard";
import SearchFilters, { type SortOption, type StarFilter } from "@/components/SearchFilters";
import HotelsMapPanel from "@/components/HotelsMapPanel";
import type { Offer } from "@/lib/types";
import type { LivePriceResult } from "@/lib/travala-price";
import { useTranslations } from "@/i18n/useTranslations";

export type StaysSearchContext = {
  query?: string;
  country?: string;
  city?: string;
  title?: string;
};

function fetchWithTimeout(url: string, ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

export default function StaysSearchResults({ context }: { context?: StaysSearchContext }) {
  const searchParams = useSearchParams();
  const { messages: m, fmt } = useTranslations();

  const urlQ = searchParams.get("q") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "2";
  const rooms = searchParams.get("rooms") || "1";

  const q = context?.query ?? urlQ;
  const country = context?.country ?? searchParams.get("country") ?? "";
  const city = context?.city ?? searchParams.get("city") ?? "";

  const displayQuery = q || city || country || "";
  const canSearch = displayQuery.trim().length > 0;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(canSearch);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState<SortOption>("recommended");
  const [starsMin, setStarsMin] = useState<StarFilter>(0);
  const [priceMax, setPriceMax] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, LivePriceResult>>({});
  const [livePricesLoading, setLivePricesLoading] = useState(false);

  const canFetchLivePrices = canSearch && Boolean(checkIn && checkOut);

  const buildParams = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams({
        type: "stays",
        limit: "48",
        sort,
        page: String(pageNum),
      });
      if (q) params.set("q", q);
      if (country) params.set("country", country);
      if (city) params.set("city", city);
      if (starsMin > 0) params.set("starsMin", String(starsMin));
      if (priceMax > 0) params.set("priceMax", String(priceMax));
      return params;
    },
    [q, country, city, sort, starsMin, priceMax],
  );

  const cardContext = { checkIn, checkOut, guests, rooms };

  useEffect(() => {
    if (!canSearch) {
      setLoading(false);
      setOffers([]);
      setTotal(0);
      setPages(1);
      setError("");
      setSource(null);
      setLivePrices({});
      return;
    }

    setLoading(true);
    setError("");
    setPage(1);
    setLivePrices({});

    fetchWithTimeout(`/api/search?${buildParams(1)}`)
      .then((r) => {
        if (!r.ok) throw new Error("search failed");
        return r.json();
      })
      .then((data) => {
        setOffers(data.offers || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
        setSource(data.source || null);
      })
      .catch(() => {
        setOffers([]);
        setTotal(0);
        setPages(1);
        setError(m.searchPage.noResultsFound);
      })
      .finally(() => setLoading(false));
  }, [buildParams, canSearch, m.searchPage.noResultsFound]);

  useEffect(() => {
    if (!canFetchLivePrices || loading || offers.length === 0) {
      setLivePricesLoading(false);
      return;
    }

    const offerIds = offers.slice(0, 24).map((o) => o.id);
    setLivePricesLoading(true);

    fetch("/api/hotel-live-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerIds,
        checkIn,
        checkOut,
        guests: Math.max(1, parseInt(guests, 10) || 2),
        rooms: Math.max(1, parseInt(rooms, 10) || 1),
      }),
    })
      .then((r) => (r.ok ? r.json() : { prices: {} }))
      .then((data) =>
        setLivePrices((prev) => ({
          ...prev,
          ...(data.prices || {}),
        })),
      )
      .catch(() => {})
      .finally(() => setLivePricesLoading(false));
  }, [offers, checkIn, checkOut, guests, rooms, canFetchLivePrices, loading]);

  const loadMore = async () => {
    if (page >= pages || loadingMore) return;
    setLoadingMore(true);
    const next = page + 1;
    try {
      const data = await fetchWithTimeout(`/api/search?${buildParams(next)}`).then((r) => r.json());
      setOffers((prev) => [...prev, ...(data.offers || [])]);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasResults = offers.length > 0;
  const heading =
    context?.title ||
    (displayQuery
      ? fmt(m.common.forQuery, { query: displayQuery })
      : m.nav.stays);

  return (
    <SiteChrome>
      <div className="bg-[#1e2e5e] py-5 sm:py-8">
        <div className="mx-auto max-w-5xl px-3 sm:px-4">
          <SearchForm
            compact
            defaultType="stays"
            defaultQuery={displayQuery}
            syncFromUrl
          />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-3 py-8 sm:px-4 sm:py-10 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#2D83C2]">{m.offerTypes.HOTEL}</p>
            <h1 className="text-2xl font-bold text-[#1e2e5e]">
              {!canSearch
                ? m.searchPage.enterDestination
                : loading
                  ? m.common.searching
                  : fmt(m.common.resultCount, { count: total.toLocaleString() })}
              {!loading && displayQuery && (
                <span className="font-normal text-gray-500"> · {heading}</span>
              )}
            </h1>
            {!loading && (checkIn || checkOut) && (
              <p className="mt-1 text-sm text-gray-500">
                {checkIn && `${m.common.checkIn} ${checkIn}`}
                {checkOut && ` · ${m.common.checkOut} ${checkOut}`}
                {` · ${guests} ${m.common.guests} · ${rooms} ${m.common.rooms}`}
              </p>
            )}
            {canFetchLivePrices && !loading && (livePricesLoading || Object.keys(livePrices).length > 0) && (
              <p className="mt-1 text-xs font-medium text-emerald-700">
                {livePricesLoading ? m.searchPage.loadingLiveRates : m.common.liveRatesOff}
              </p>
            )}
            {source === "live" && !loading && !canFetchLivePrices && (
              <p className="mt-1 text-xs font-medium text-emerald-700">{m.common.liveRatesOff}</p>
            )}
          </div>
          {!loading && hasResults && (
            <span className="rounded-full bg-[#2dd4bf]/20 px-3 py-1 text-xs font-semibold text-[#1e2e5e]">
              {m.common.bestPriceGuarantee}
            </span>
          )}
        </div>

        {canSearch && !loading && (
          <div className="mt-6">
            <SearchFilters
              sort={sort}
              onSortChange={setSort}
              total={total}
              starsMin={starsMin}
              onStarsChange={setStarsMin}
              priceMax={priceMax}
              onPriceMaxChange={setPriceMax}
              showMap={showMap}
              onToggleMap={() => setShowMap((v) => !v)}
            />
          </div>
        )}

        {!canSearch ? (
          <div className="mt-12 text-center">
            <p className="text-lg font-medium text-[#1e2e5e]">{m.searchPage.enterDestination}</p>
            <p className="mt-2 text-sm text-gray-500">{m.common.whereTo}</p>
          </div>
        ) : loading ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : error || !hasResults ? (
          <div className="mt-12 text-center">
            <p className="text-gray-500">{error || m.searchPage.noResultsFound}</p>
            <p className="mt-2 text-sm text-gray-400">{m.searchPage.tryStays}</p>
          </div>
        ) : (
          <div className={`mt-8 gap-6 ${showMap ? "grid lg:grid-cols-[1fr_320px]" : ""}`}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  searchContext={cardContext}
                  livePrice={livePrices[offer.id]}
                  priceLoading={canFetchLivePrices && livePricesLoading && !livePrices[offer.id]}
                />
              ))}
            </div>
            {showMap && (
              <div className="lg:sticky lg:top-20 lg:self-start">
                <HotelsMapPanel offers={offers} centerLabel={displayQuery} />
              </div>
            )}
            {page < pages && (
              <div className={`mt-10 text-center ${showMap ? "lg:col-span-2" : ""}`}>
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-lg bg-[#2D83C2] px-8 py-3 text-sm font-semibold text-white hover:bg-[#1e2e5e] disabled:opacity-60"
                >
                  {loadingMore ? m.common.loading : fmt(m.searchPage.loadMore, { shown: offers.length, total })}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </SiteChrome>
  );
}
