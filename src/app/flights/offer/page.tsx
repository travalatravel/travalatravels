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
import { useAuth } from "@/context/AuthContext";
import CryptoMethodPicker from "@/components/CryptoMethodPicker";
import { CRYPTO_PAYMENT_METHODS } from "@/lib/payments";
import { useFlightOffer } from "@/hooks/useFlightOffer";
import { appendBundleHotelParams, type BundleHotelSelection } from "@/lib/flight-hotel-bundle";
import { useTranslations } from "@/i18n/useTranslations";
import { cabinLabel } from "@/i18n/cabin-label";

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
  const { messages: m, fmt } = useTranslations();
  const { flight, token, loading } = useFlightOffer(searchParams);
  const [paymentMethod, setPaymentMethod] = useState<(typeof CRYPTO_PAYMENT_METHODS)[number]>("CRYPTO_BTC");
  const [selectedHotel, setSelectedHotel] = useState<BundleHotelSelection | null>(null);

  const addHotel = searchParams.get("addHotel") === "1";
  const depart = searchParams.get("depart") || flight?.departAt.slice(0, 10) || "";
  const returnDate = searchParams.get("return") || flight?.returnLeg?.departAt.slice(0, 10) || depart;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2D83C2] border-t-transparent" />
      </div>
    );
  }

  if (!flight || !token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-500">{m.searchPage.flightOfferInvalid}</p>
        <Link href="/flights" className="mt-4 inline-block text-[#2D83C2] hover:underline">
          {m.common.searchFlights}
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
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1 text-sm text-[#2D83C2] hover:underline">
        <ArrowLeft size={16} /> {m.common.backToResults}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <span className="rounded-full bg-[#2D83C2]/10 px-3 py-1 text-xs font-semibold text-[#2D83C2]">{m.common.flightLabel}</span>
          <h1 className="mt-3 text-xl font-bold text-[#1a1a1a] sm:text-2xl lg:text-3xl">
            {flight.airline} · {flight.from} → {flight.to}
          </h1>
          <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <Plane size={16} />
            {flight.fromCode} to {flight.toCode} · {cabinLabel(flight.cabin, m)}
          </p>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="text-lg font-bold text-[#1a1a1a]">{m.common.flightItinerary}</h2>
            {flight.segments.map((seg, i) => (
              <div key={i} className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 first:mt-3 first:border-t-0 first:pt-0">
                <div>
                  <p className="font-semibold text-[#1a1a1a]">{seg.airline}</p>
                  {seg.flightNumber && <p className="text-xs text-gray-500">{seg.flightNumber}</p>}
                </div>
                <div className="text-sm">
                  <span className="text-xl font-bold text-[#1a1a1a]">{formatTime(seg.departAt)}</span>
                  <span className="mx-2 text-gray-300">→</span>
                  <span className="text-xl font-bold text-[#1a1a1a]">{formatTime(seg.arriveAt)}</span>
                  <p className="text-xs text-gray-500">
                    {seg.fromCode} → {seg.toCode} · {seg.duration}
                  </p>
                </div>
              </div>
            ))}
            <p className="mt-4 text-sm text-gray-600">
              <strong>{m.common.depart}:</strong> {formatDate(flight.departAt)}
              {flight.trip === "roundtrip" && flight.returnLeg && (
                <>
                  {" · "}
                  <strong>{m.common.return}:</strong> {formatDate(flight.returnLeg.departAt)}
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
              { icon: Luggage, title: m.common.baggage, text: m.common.baggageText },
              { icon: Briefcase, title: m.common.cabin, text: cabinLabel(flight.cabin, m) },
              { icon: Clock, title: m.common.duration, text: flight.duration },
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

        <div>
          {selectedHotel ? (
            <div className="lg:sticky lg:top-20">
              <FlightBundleSummary flight={flight} flightTotal={pricing.salePrice} hotel={selectedHotel} />
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <label className="text-xs font-medium text-gray-500">{m.common.paymentMethod}</label>
                <p className="mb-2 text-[11px] text-gray-400">{m.common.gatewayName}</p>
                <CryptoMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-5 w-full min-h-12 rounded-xl bg-[#2D83C2] py-3.5 text-sm font-bold text-white hover:bg-[#1a5f94]"
                >
                  {user ? m.common.continuePassengers : m.searchPage.logInToBook}
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:sticky lg:top-20">
              <div className="flex items-center gap-2 bg-[#2D83C2] px-4 py-2.5 text-white">
                <Tag size={14} />
                <span className="text-sm font-semibold">{fmt(m.common.savePctGuarantee, { pct: pricing.discountPct })}</span>
              </div>
              <div className="p-5">
                <p className="text-3xl font-bold text-[#1a1a1a]">{formatUsd(pricing.salePrice)}</p>
                <p className="text-sm text-gray-400 line-through">{formatUsd(pricing.originalPrice)}</p>
              <p className="mt-1 text-xs text-[#2D83C2]">{fmt(m.common.youSave, { amount: formatUsd(pricing.savings) })}</p>
              <p className="mt-2 text-xs text-gray-500">{fmt(m.common.totalForPassengers, { count: pax })}</p>

                <div className="mt-5">
                  <label className="text-xs font-medium text-gray-500">{m.common.paymentMethod}</label>
                  <p className="mb-2 text-[11px] text-gray-400">{m.common.gatewayName}</p>
                  <CryptoMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-5 w-full min-h-12 rounded-xl bg-[#2D83C2] py-3.5 text-sm font-bold text-white hover:bg-[#1a5f94]"
                >
                  {user ? m.common.continuePassengers : m.searchPage.logInToBook}
                </button>
                <p className="mt-2 text-center text-[10px] text-gray-400">{m.common.fareRules}</p>
              </div>
            </div>
          )}
          {addHotel && !selectedHotel && (
            <p className="mt-3 text-center text-xs text-gray-500">
              {m.searchPage.selectHotelHint}
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
