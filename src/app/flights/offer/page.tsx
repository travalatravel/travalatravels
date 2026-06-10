"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plane, Clock, Luggage, Shield, Briefcase, Tag } from "lucide-react";
import SiteChrome from "@/components/SiteChrome";
import FlightHotelBundle from "@/components/FlightHotelBundle";
import FlightBundleSummary from "@/components/FlightBundleSummary";
import { getFlightPricing } from "@/lib/flight-pricing";
import { formatUsd } from "@/lib/pricing";
import { CABIN_LABELS } from "@/lib/flight-types";
import { useAuth } from "@/context/AuthContext";
import CryptoMethodPicker from "@/components/CryptoMethodPicker";
import { CRYPTO_PAYMENT_METHODS, GATEWAY_NAME } from "@/lib/payments";
import { useFlightOffer } from "@/hooks/useFlightOffer";
import { appendBundleHotelParams, type BundleHotelSelection } from "@/lib/flight-hotel-bundle";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "--:--";
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

function FlightOfferContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { flight, token, loading } = useFlightOffer(searchParams);
  const [paymentMethod, setPaymentMethod] = useState<(typeof CRYPTO_PAYMENT_METHODS)[number]>("CRYPTO_BTC");
  const [selectedHotel, setSelectedHotel] = useState<BundleHotelSelection | null>(null);

  const addHotel = searchParams.get("addHotel") === "1";
  const depart = searchParams.get("depart") || flight?.departAt.slice(0, 10) || "";
  const returnDate = searchParams.get("return") || flight?.returnLeg?.departAt.slice(0, 10) || depart;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2577be] border-t-transparent" />
      </div>
    );
  }

  if (!flight || !token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-500">Flight offer expired or invalid. Please search again.</p>
        <Link href="/flights" className="mt-4 inline-block text-[#2577be] hover:underline">
          Search flights
        </Link>
      </div>
    );
  }

  const pricing = getFlightPricing(flight.sourcePrice);
  const pax = flight.adults + flight.children + flight.infants;
  const buildCheckoutUrl = () => {
    const qs = new URLSearchParams({ token, paymentMethod });
    if (selectedHotel) {
      qs.set("hotelTitle", selectedHotel.title);
      appendBundleHotelParams(qs, selectedHotel);
    }
    return `/flights/checkout?${qs.toString()}`;
  };

  const handleContinue = () => {
    const checkoutUrl = buildCheckoutUrl();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
      return;
    }
    router.push(checkoutUrl);
  };

  const backHref = (() => {
    const qs = new URLSearchParams({ type: "flights", from: flight.from, to: flight.to, depart, trip: flight.trip, cabin: flight.cabin });
    if (returnDate) qs.set("return", returnDate);
    if (addHotel) qs.set("addHotel", "1");
    return `/search?${qs.toString()}`;
  })();

  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1 text-sm text-[#2577be] hover:underline">
        <ArrowLeft size={16} /> Back to results
      </Link>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <span className="rounded-full bg-[#2577be]/10 px-3 py-1 text-xs font-semibold text-[#2577be]">Flight</span>
          <h1 className="mt-3 text-xl font-bold text-[#1e2e5e] sm:text-2xl lg:text-3xl">
            {flight.airline} · {flight.from} → {flight.to}
          </h1>
          <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <Plane size={16} />
            {flight.fromCode} to {flight.toCode} · {CABIN_LABELS[flight.cabin]}
          </p>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="text-lg font-bold text-[#1e2e5e]">Flight itinerary</h2>
            {flight.segments.map((seg, i) => (
              <div key={i} className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 first:mt-3 first:border-t-0 first:pt-0">
                <div>
                  <p className="font-semibold text-[#1e2e5e]">{seg.airline}</p>
                  {seg.flightNumber && <p className="text-xs text-gray-500">{seg.flightNumber}</p>}
                </div>
                <div className="text-sm">
                  <span className="text-xl font-bold text-[#1e2e5e]">{formatTime(seg.departAt)}</span>
                  <span className="mx-2 text-gray-300">→</span>
                  <span className="text-xl font-bold text-[#1e2e5e]">{formatTime(seg.arriveAt)}</span>
                  <p className="text-xs text-gray-500">
                    {seg.fromCode} → {seg.toCode} · {seg.duration}
                  </p>
                </div>
              </div>
            ))}
            <p className="mt-4 text-sm text-gray-600">
              <strong>Depart:</strong> {formatDate(flight.departAt)}
              {flight.trip === "roundtrip" && flight.returnLeg && (
                <>
                  {" · "}
                  <strong>Return:</strong> {formatDate(flight.returnLeg.departAt)}
                </>
              )}
            </p>
          </section>

          {addHotel && (
            <FlightHotelBundle
              destination={flight.to}
              depart={depart}
              returnDate={returnDate}
              guests={pax}
              selectedHotelId={selectedHotel?.offerId}
              onSelectHotel={setSelectedHotel}
              compact
            />
          )}

          <section className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { icon: Luggage, title: "Baggage", text: "1 carry-on included. Checked bag from $35." },
              { icon: Briefcase, title: "Cabin", text: CABIN_LABELS[flight.cabin] },
              { icon: Clock, title: "Duration", text: flight.duration },
              { icon: Shield, title: "Flexibility", text: "Change fees may apply. See fare rules at checkout." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                <item.icon size={18} className="text-[#2577be]" />
                <p className="mt-2 text-sm font-semibold text-[#1e2e5e]">{item.title}</p>
                <p className="mt-1 text-xs text-gray-500">{item.text}</p>
              </div>
            ))}
          </section>
        </div>

        <div>
          {selectedHotel ? (
            <div className="lg:sticky lg:top-20">
              <FlightBundleSummary flight={flight} flightTotal={pricing.salePrice} hotel={selectedHotel} />
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <label className="text-xs font-medium text-gray-500">Payment method</label>
                <p className="mb-2 text-[11px] text-gray-400">{GATEWAY_NAME}</p>
                <CryptoMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-5 w-full min-h-12 rounded-xl bg-[#2577be] py-3.5 text-sm font-bold text-white hover:bg-[#1e2e5e]"
                >
                  {user ? "Continue — passenger details →" : "Log in to book"}
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:sticky lg:top-20">
              <div className="flex items-center gap-2 bg-[#2577be] px-4 py-2.5 text-white">
                <Tag size={14} />
                <span className="text-sm font-semibold">Save {pricing.discountPct}% — Best price guarantee</span>
              </div>
              <div className="p-5">
                <p className="text-3xl font-bold text-[#1e2e5e]">{formatUsd(pricing.salePrice)}</p>
                <p className="text-sm text-gray-400 line-through">{formatUsd(pricing.originalPrice)}</p>
                <p className="mt-1 text-xs text-[#2577be]">You save {formatUsd(pricing.savings)}</p>
                <p className="mt-2 text-xs text-gray-500">Total for {pax} passenger{pax !== 1 ? "s" : ""}</p>

                <div className="mt-5">
                  <label className="text-xs font-medium text-gray-500">Payment method</label>
                  <p className="mb-2 text-[11px] text-gray-400">{GATEWAY_NAME}</p>
                  <CryptoMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-5 w-full min-h-12 rounded-xl bg-[#2577be] py-3.5 text-sm font-bold text-white hover:bg-[#1e2e5e]"
                >
                  {user ? "Continue — passenger details →" : "Log in to book"}
                </button>
                <p className="mt-2 text-center text-[10px] text-gray-400">Fare rules apply · Price held for 15 minutes</p>
              </div>
            </div>
          )}
          {addHotel && !selectedHotel && (
            <p className="mt-3 text-center text-xs text-gray-500">
              Select a hotel above to save an extra 10% on your stay
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function FlightOfferPage() {
  return (
    <SiteChrome>
      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
        <FlightOfferContent />
      </Suspense>
    </SiteChrome>
  );
}
