"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SiteChrome from "@/components/SiteChrome";
import BookingCheckoutForm from "@/components/BookingCheckoutForm";
import FlightBundleSummary from "@/components/FlightBundleSummary";
import { useFlightOffer } from "@/hooks/useFlightOffer";
import { parseBundleHotelFromParams } from "@/lib/flight-hotel-bundle";
import { useAuth } from "@/context/AuthContext";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { flight, token, loading: offerLoading } = useFlightOffer(searchParams);
  const [systemOfferId, setSystemOfferId] = useState<string | null>(null);
  const bundleHotel = parseBundleHotelFromParams(searchParams);

  useEffect(() => {
    if (authLoading || offerLoading) return;
    if (!user && token) {
      router.push(`/login?redirect=${encodeURIComponent(`/flights/checkout?${searchParams.toString()}`)}`);
    }
  }, [user, authLoading, offerLoading, router, token, searchParams]);

  useEffect(() => {
    fetch("/api/flights/system-offer")
      .then((r) => r.json())
      .then((d) => setSystemOfferId(d.offerId))
      .catch(() => setSystemOfferId(null));
  }, []);

  if (authLoading || offerLoading || !flight) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2577be] border-t-transparent" />
      </div>
    );
  }

  if (!token || !systemOfferId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-gray-500">
        {!token ? "Flight offer expired or invalid. Please search again." : "Preparing checkout…"}
      </div>
    );
  }

  const checkIn = bundleHotel?.checkIn ?? flight.departAt.slice(0, 10);
  const checkOut = bundleHotel?.checkOut ?? flight.returnLeg?.departAt.slice(0, 10) ?? flight.arriveAt.slice(0, 10);
  const pax = flight.adults + flight.children + flight.infants;
  const bundleTotal = flight.salePrice + (bundleHotel?.hotelTotal ?? 0);

  const stubOffer = {
    id: systemOfferId,
    type: "FLIGHT" as const,
    title: bundleHotel
      ? `${flight.airline} + Hotel · ${flight.from} → ${flight.to}`
      : `${flight.airline} · ${flight.from} → ${flight.to}`,
    description: bundleHotel ? "Flight + hotel bundle" : "Live flight booking",
    location: `${flight.fromCode} → ${flight.toCode}`,
    city: flight.from,
    country: flight.to,
    region: null,
    price: bundleTotal,
    stars: null,
    image: "https://static.travala.com/resources/images-pc/rebranding/flight-banner.jpg",
    metadata: JSON.stringify({ airline: flight.airline, source: "live", bundle: Boolean(bundleHotel) }),
  };

  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Link
        href={(() => {
          const back = new URLSearchParams(searchParams.toString());
          back.delete("token");
          back.set("id", flight.id);
          return `/flights/offer?${back.toString()}`;
        })()}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#2577be] hover:underline"
      >
        <ArrowLeft size={16} /> Back to flight
      </Link>

      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Step 1 of 2</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1e2e5e] md:text-3xl">
          {bundleHotel ? "Enter details for your trip" : "Enter passenger details"}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="order-2 lg:order-1 lg:col-span-2">
          <BookingCheckoutForm
            offer={stubOffer}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={pax}
            rooms={bundleHotel?.rooms ?? 1}
            cabin={flight.cabin}
            trip={flight.trip}
            liveFlightToken={token}
            liveFlightTotal={flight.salePrice}
            bundleHotelOfferId={bundleHotel?.offerId}
            bundleHotelTotal={bundleHotel?.hotelTotal}
            bundleHotelCheckIn={bundleHotel?.checkIn}
            bundleHotelCheckOut={bundleHotel?.checkOut}
            bundleHotelRooms={bundleHotel?.rooms}
            bundleTotal={bundleHotel ? bundleTotal : undefined}
          />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <FlightBundleSummary flight={flight} flightTotal={flight.salePrice} hotel={bundleHotel} />
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
