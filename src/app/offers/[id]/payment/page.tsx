"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import CryptoGatewayPanel from "@/components/CryptoGatewayPanel";
import BookingOrderSummary from "@/components/BookingOrderSummary";
import BundlePaymentSummary from "@/components/BundlePaymentSummary";
import BookingGuestSummary from "@/components/BookingGuestSummary";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/i18n/useTranslations";
import type { Booking } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

function PaymentContent() {
  const { id } = useParams<{ id: string }>();
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
      router.push(`/login?redirect=/offers/${id}/payment?bookingId=${bookingId}`);
      return;
    }
    refresh();
  }, [user, authLoading, bookingId, id, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2577be] border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-500">{c.bookingNotFound}</p>
        <Link href="/my-trips" className="mt-4 inline-block text-[#2577be] hover:underline">
          {m.paymentPage.myTrips}
        </Link>
      </div>
    );
  }

  const nights =
    booking.checkIn && booking.checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : undefined;

  const bundleTotal =
    bundleBooking && bundleId ? booking.totalPrice + bundleBooking.totalPrice : undefined;

  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Link
        href={`/offers/${id}/checkout?checkIn=${booking.checkIn?.slice(0, 10)}&checkOut=${booking.checkOut?.slice(0, 10)}&guests=${booking.guests}&rooms=${booking.rooms}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#2577be] hover:underline"
      >
        <ArrowLeft size={16} /> {c.editGuestDetails}
      </Link>

      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">{c.step2}</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1e2e5e] md:text-3xl">{c.completePayment}</h1>
        <p className="mt-2 text-slate-500">{c.paymentReview}</p>
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
          {bundleBooking && bundleId ? (
            <BundlePaymentSummary flightBooking={booking} hotelBooking={bundleBooking} />
          ) : (
            <BookingOrderSummary
              offer={booking.offer}
              checkIn={booking.checkIn?.slice(0, 10)}
              checkOut={booking.checkOut?.slice(0, 10)}
              guests={booking.guests}
              rooms={booking.rooms}
              totalPrice={booking.totalPrice}
              nights={nights}
              specialRequests={booking.specialRequests}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <SiteChrome>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2577be] border-t-transparent" />
          </div>
        }
      >
        <PaymentContent />
      </Suspense>
    </SiteChrome>
  );
}
