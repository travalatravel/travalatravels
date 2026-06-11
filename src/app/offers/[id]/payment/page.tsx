"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import CryptoPayGateway from "@/components/CryptoPayGateway";
import { useTranslations } from "@/i18n/useTranslations";
import type { Booking } from "@/lib/types";

function GatewayLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0e17]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );
}

function PaymentContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { messages: m } = useTranslations();
  const bookingId = searchParams.get("bookingId");
  const bundleId = searchParams.get("bundleId");
  const access = searchParams.get("access") || "";
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bundleBooking, setBundleBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    if (!bookingId) return;
    const qs = new URLSearchParams();
    if (access) qs.set("access", access);
    if (bundleId) qs.set("bundleId", bundleId);
    fetch(`/api/bookings/${bookingId}/payment?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setBooking(d.booking ?? null);
        setBundleBooking(d.bundleBooking ?? null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, access, bundleId]);

  if (loading) return <GatewayLoading />;

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0e17] px-4">
        <div className="text-center">
          <p className="text-slate-400">{m.checkout.bookingNotFound}</p>
          <Link
            href={`/offers/${id}`}
            className="mt-4 inline-block text-blue-400 hover:underline"
          >
            {m.checkout.backToOffer}
          </Link>
        </div>
      </div>
    );
  }

  const bundleTotal =
    bundleBooking && bundleId ? booking.totalPrice + bundleBooking.totalPrice : undefined;

  return (
    <CryptoPayGateway
      booking={booking}
      onPaid={refresh}
      onBookingChange={setBooking}
      bundleBookingId={bundleId || undefined}
      bundleTotal={bundleTotal}
      accessToken={access || undefined}
    />
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<GatewayLoading />}>
      <PaymentContent />
    </Suspense>
  );
}
