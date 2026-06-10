"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FlashSaleBanner from "@/components/FlashSaleBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/lib/types";

function SearchResults() {
  const searchParams = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "stays";

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const params = new URLSearchParams({ type, limit: "48" });
    if (q) params.set("q", q);
    fetch(`/api/search?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setOffers(data.offers || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [q, type]);

  const loadMore = async () => {
    if (page >= pages || loadingMore) return;
    setLoadingMore(true);
    const next = page + 1;
    const params = new URLSearchParams({ type, limit: "48", page: String(next) });
    if (q) params.set("q", q);
    const data = await fetch(`/api/search?${params}`).then((r) => r.json());
    setOffers((prev) => [...prev, ...(data.offers || [])]);
    setPage(next);
    setLoadingMore(false);
  };

  return (
    <>
      <FlashSaleBanner />
      <Header />
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e2e5e] py-8">
        <div className="mx-auto max-w-5xl px-4">
          <SearchForm defaultType={type} defaultQuery={q} compact />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-600">Luxury deals · Flash pricing active</p>
            <h1 className="text-2xl font-bold text-[#1e2e5e]">
              {loading ? "Searching..." : `${total} exclusive offers`}
              {q && <span className="font-normal text-gray-500"> in &ldquo;{q}&rdquo;</span>}
            </h1>
          </div>
          {!loading && total > 0 && (
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
              Up to 62% off today
            </span>
          )}
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-gray-500">No results found. Try a different search term.</p>
            <p className="mt-2 text-sm text-gray-400">
              Try: London, Paris, Dubai, Las Vegas, Tokyo, Barcelona
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
            {page < pages && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-full bg-[#1e2e5e] px-8 py-3 text-sm font-semibold text-white hover:bg-[#2a3f7a] disabled:opacity-60"
                >
                  {loadingMore ? "Loading…" : `Load more (${offers.length} of ${total})`}
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
