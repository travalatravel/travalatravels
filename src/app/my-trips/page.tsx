"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OfferImage from "@/components/OfferImage";
import SiteChrome from "@/components/SiteChrome";
import { useAuth } from "@/context/AuthContext";
import type { Booking, OfferType } from "@/lib/types";
import { PAYMENT_STATUS_COLORS } from "@/lib/types";
import CryptoGatewayPanel from "@/components/CryptoGatewayPanel";
import { guestDisplayName } from "@/lib/booking-guest";
import { useTranslations } from "@/i18n/useTranslations";
import { offerTypeLabel, paymentStatusLabel, cryptoPaymentLabel } from "@/i18n/display-labels";

export default function MyTripsPage() {
  const { messages: m, fmt } = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const loadBookings = () => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/my-trips");
      return;
    }
    loadBookings();
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2D83C2] border-t-transparent" />
      </div>
    );
  }

  return (
    <SiteChrome>
      <main className="mx-auto max-w-4xl px-3 py-8 sm:px-4 sm:py-10 lg:px-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">{m.myTrips.title}</h1>
        <p className="mt-1 text-gray-500">{fmt(m.common.welcomeBackUser, { name: user.name })}</p>

        {loading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <p className="text-gray-500">{m.myTrips.empty}</p>
            <Link href="/stays" className="mt-4 inline-block rounded-xl bg-[#2D83C2] px-6 py-3 text-sm font-semibold text-white">
              {m.myTrips.startSearching}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-32">
                    <OfferImage
                      src={booking.offer.image}
                      alt={booking.offer.title}
                      metadata={booking.offer.metadata}
                      offerType={booking.offer.type as OfferType}
                      city={booking.offer.city}
                      country={booking.offer.country}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_COLORS[booking.paymentStatus]}`}>
                            {paymentStatusLabel(m, booking.paymentStatus)}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                            {booking.status}
                          </span>
                        </div>
                        <h3 className="mt-1 font-semibold text-[#1a1a1a]">{booking.offer.title}</h3>
                        {booking.guestFirstName && (
                          <p className="text-xs text-gray-500">
                            {m.common.guestLabel} {guestDisplayName(booking) || m.common.defaultGuest}
                            {booking.bookingType === "BUSINESS" && booking.companyName
                              ? ` · ${booking.companyName}`
                              : ""}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{offerTypeLabel(m, booking.offer.type as OfferType)} · {booking.offer.location}</p>
                      </div>
                      <span className="text-lg font-bold text-[#2D83C2] sm:flex-shrink-0">${booking.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                      {booking.checkIn && <span>{m.myTrips.checkInLabel} {new Date(booking.checkIn).toLocaleDateString()}</span>}
                      {booking.checkOut && <span>{m.myTrips.checkOutLabel} {new Date(booking.checkOut).toLocaleDateString()}</span>}
                      <span>{fmt(booking.guests > 1 ? m.myTrips.guestsCount : m.myTrips.guestCount, { count: booking.guests })}</span>
                      <span>
                        {m.common.paymentLabel}{" "}
                        {cryptoPaymentLabel(m, booking.paymentMethod)}
                      </span>
                      <span>{m.common.booked} {new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                    {(booking.paymentStatus === "PENDING" || booking.paymentStatus === "FAILED") &&
                      booking.paymentMethod.startsWith("CRYPTO_") && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/offers/${booking.offerId}/payment?bookingId=${booking.id}`}
                          className="rounded-lg bg-[#2D83C2] px-4 py-2 text-xs font-semibold text-white"
                        >
                          {m.common.completePaymentBtn}
                        </Link>
                        <button
                          onClick={() => setPayingId(payingId === booking.id ? null : booking.id)}
                          className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600"
                        >
                          {payingId === booking.id ? m.common.hide : m.common.payHere}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {payingId === booking.id && (
                  <div className="mt-4">
                    <CryptoGatewayPanel booking={booking} onPaid={loadBookings} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </SiteChrome>
  );
}
