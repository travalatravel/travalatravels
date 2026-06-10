"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import CryptoGatewayPanel from "@/components/CryptoGatewayPanel";
import BookingGuestSummary from "@/components/BookingGuestSummary";
import FlightBundleSummary from "@/components/FlightBundleSummary";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/i18n/useTranslations";
import type { Booking } from "@/lib/types";
import { parseFlightBookingMeta } from "@/lib/flight-route";
import { decodeFlightToken } from "@/lib/flight-token";
import { normalizeFlightPayload } from "@/lib/flight-route";
import { ArrowLeft } from "lucide-react";

function FlightPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { messages: m } = useTranslations();
  const c = m.checkout;
  const { user, loading: authLoading } = useAuth();
  const bookingId = searchParams.get("bookingId");
  const bundleId = searchParams.get("bundleId");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bundleBooking, setBundleBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    if (!bookingId) return;
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.bookings as Booking[] | undefined) ?? [];
        const found = list.find((b) => b.id === bookingId);
        setBooking(found ?? null);
        if (bundleId) {
          setBundleBooking(list.find((b) => b.id === bundleId) ?? null);
        } else {
          setBundleBooking(null);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/flights/payment?bookingId=${bookingId}`);
      return;
    }
    refresh();
  }, [user, authLoading, bookingId, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2D83C2] border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-500">{c.bookingNotFound}</p>
        <Link href="/my-trips" className="mt-4 inline-block text-[#2D83C2] hover:underline">
          {m.paymentPage.myTrips}
        </Link>
      </div>
    );
  }

  const flightMeta = parseFlightBookingMeta(booking.specialRequests);
  let flightToken: string | null = null;
  try {
    const raw = booking.specialRequests ? JSON.parse(booking.specialRequests) : null;
    flightToken = typeof raw?.token === "string" ? raw.token : null;
  } catch {
    flightToken = null;
  }
  const decoded = flightToken ? decodeFlightToken(flightToken) : null;
  const flight = decoded ? normalizeFlightPayload(decoded) : null;
  const bundleTotal =
    bundleBooking && bundleId ? booking.totalPrice + bundleBooking.totalPrice : undefined;

  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Link
        href="/my-trips"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#2D83C2] hover:underline"
      >
        <ArrowLeft size={16} /> {m.paymentPage.myTrips}
      </Link>

      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">{c.step2}</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1a1a1a] md:text-3xl">{c.completePayment}</h1>
        <p className="mt-2 text-slate-500">{m.paymentPage.cryptoPayment}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
          <BookingGuestSummary booking={booking} />
          <CryptoGatewayPanel
            booking={booking}
            onPaid={refresh}
            bundleBookingId={bundleId || undefined}
            bundleTotal={bundleTotal}
          />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-1">
          {flight ? (
            <FlightBundleSummary
              flight={flight}
              flightTotal={booking.totalPrice}
              hotel={
                bundleBooking
                  ? {
                      offerId: bundleBooking.offerId,
                      title: flightMeta?.hotelTitle || bundleBooking.offer.title,
                      hotelTotal: bundleBooking.totalPrice,
                      checkIn: bundleBooking.checkIn?.slice(0, 10) || "",
                      checkOut: bundleBooking.checkOut?.slice(0, 10) || "",
                      rooms: bundleBooking.rooms,
                      guests: bundleBooking.guests,
                      nights: Math.max(
                        1,
                        Math.ceil(
                          ((bundleBooking.checkOut ? new Date(bundleBooking.checkOut).getTime() : 0) -
                            (bundleBooking.checkIn ? new Date(bundleBooking.checkIn).getTime() : 0)) /
                            (1000 * 60 * 60 * 24),
                        ),
                      ),
                    }
                  : null
              }
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#1a1a1a]">{booking.offer.title}</p>
              <p className="mt-2 text-2xl font-bold text-[#1a1a1a]">${booking.totalPrice.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function FlightPaymentPage() {
  return (
    <SiteChrome>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2D83C2] border-t-transparent" />
          </div>
        }
      >
        <FlightPaymentContent />
      </Suspense>
    </SiteChrome>
  );
}
