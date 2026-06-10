"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FlashSaleBanner from "@/components/FlashSaleBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CryptoGatewayPanel from "@/components/CryptoGatewayPanel";
import BookingOrderSummary from "@/components/BookingOrderSummary";
import BookingGuestSummary from "@/components/BookingGuestSummary";
import { useAuth } from "@/context/AuthContext";
import type { Booking } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

function PaymentContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    if (!bookingId) return;
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        const found = (d.bookings as Booking[] | undefined)?.find((b) => b.id === bookingId);
        setBooking(found ?? null);
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
        <p className="text-gray-500">Booking not found.</p>
        <Link href="/my-trips" className="mt-4 inline-block text-[#2577be] hover:underline">
          My Trips
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

  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Link
        href={`/offers/${id}/checkout?checkIn=${booking.checkIn?.slice(0, 10)}&checkOut=${booking.checkOut?.slice(0, 10)}&guests=${booking.guests}&rooms=${booking.rooms}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#2577be] hover:underline"
      >
        <ArrowLeft size={16} /> Edit guest details
      </Link>

      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Step 2 of 2</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1e2e5e] md:text-3xl">Complete payment</h1>
        <p className="mt-2 text-slate-500">Review your details and pay securely with cryptocurrency.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
          <BookingGuestSummary booking={booking} />
          <CryptoGatewayPanel booking={booking} onPaid={refresh} />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-1">
          <BookingOrderSummary
            offer={booking.offer}
            checkIn={booking.checkIn?.slice(0, 10)}
            checkOut={booking.checkOut?.slice(0, 10)}
            guests={booking.guests}
            rooms={booking.rooms}
            totalPrice={booking.totalPrice}
            nights={nights}
          />
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <>
      <FlashSaleBanner />
      <Header />
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2577be] border-t-transparent" />
          </div>
        }
      >
        <PaymentContent />
      </Suspense>
      <Footer />
    </>
  );
}
