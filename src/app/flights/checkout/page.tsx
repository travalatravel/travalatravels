"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SiteChrome from "@/components/SiteChrome";
import BookingCheckoutForm from "@/components/BookingCheckoutForm";
import { decodeFlightToken } from "@/lib/flight-token";
import { formatUsd } from "@/lib/pricing";
import { CABIN_LABELS } from "@/lib/flight-types";
import { useAuth } from "@/context/AuthContext";

function LiveFlightSummary({
  flight,
  totalPrice,
}: {
  flight: NonNullable<ReturnType<typeof decodeFlightToken>>;
  totalPrice: number;
}) {
  const pax = flight.adults + flight.children + flight.infants;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#1e2e5e] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Flight</p>
        <h3 className="mt-1 font-semibold leading-snug">{flight.airline}</h3>
        <p className="mt-1 text-sm text-white/80">
          {flight.from} → {flight.to}
        </p>
      </div>
      <div className="space-y-2 p-5 text-sm text-gray-600">
        <p>
          <span className="text-gray-400">Depart · </span>
          {flight.departAt.slice(0, 10)}
        </p>
        <p>
          <span className="text-gray-400">Cabin · </span>
          {CABIN_LABELS[flight.cabin]}
        </p>
        <p>
          <span className="text-gray-400">Passengers · </span>
          {pax}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="font-semibold text-[#1e2e5e]">Total</span>
          <span className="text-2xl font-bold text-[#1e2e5e]">{formatUsd(totalPrice)}</span>
        </div>
        <p className="text-[10px] text-gray-400">Best price guarantee · Taxes included</p>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const token = searchParams.get("token") || "";
  const flight = decodeFlightToken(token);
  const [systemOfferId, setSystemOfferId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/flights/checkout?token=${encodeURIComponent(token)}`);
    }
  }, [user, authLoading, router, token]);

  useEffect(() => {
    fetch("/api/flights/system-offer")
      .then((r) => r.json())
      .then((d) => setSystemOfferId(d.offerId))
      .catch(() => setSystemOfferId(null));
  }, []);

  if (authLoading || !flight) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2577be] border-t-transparent" />
      </div>
    );
  }

  if (!systemOfferId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-gray-500">
        Preparing checkout…
      </div>
    );
  }

  const checkIn = flight.departAt.slice(0, 10);
  const checkOut = flight.arriveAt.slice(0, 10);
  const pax = flight.adults + flight.children + flight.infants;

  const stubOffer = {
    id: systemOfferId,
    type: "FLIGHT" as const,
    title: `${flight.airline} · ${flight.from} → ${flight.to}`,
    description: "Live flight booking",
    location: `${flight.fromCode} → ${flight.toCode}`,
    city: flight.from,
    country: flight.to,
    region: null,
    price: flight.salePrice,
    stars: null,
    image: "https://static.travala.com/resources/images-pc/rebranding/flight-banner.jpg",
    metadata: JSON.stringify({ airline: flight.airline, source: "live" }),
  };

  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Link href={`/flights/offer?token=${encodeURIComponent(token)}`} className="mb-6 inline-flex items-center gap-1 text-sm text-[#2577be] hover:underline">
        <ArrowLeft size={16} /> Back to flight
      </Link>

      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Step 1 of 2</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1e2e5e] md:text-3xl">Enter passenger details</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="order-2 lg:order-1 lg:col-span-2">
          <BookingCheckoutForm
            offer={stubOffer}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={pax}
            rooms={1}
            cabin={flight.cabin}
            trip={flight.trip}
            liveFlightToken={token}
            liveFlightTotal={flight.salePrice}
          />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <LiveFlightSummary flight={flight} totalPrice={flight.salePrice} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function FlightCheckoutPage() {
  return (
    <SiteChrome>
      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </SiteChrome>
  );
}
