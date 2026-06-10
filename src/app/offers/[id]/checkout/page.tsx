"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import BookingCheckoutForm from "@/components/BookingCheckoutForm";
import BookingOrderSummary from "@/components/BookingOrderSummary";
import { useAuth } from "@/context/AuthContext";
import type { Offer } from "@/lib/types";
import { applySalePrice } from "@/lib/pricing";
import { ArrowLeft } from "lucide-react";

function CheckoutContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Math.max(1, parseInt(searchParams.get("guests") || "2", 10));
  const rooms = Math.max(1, parseInt(searchParams.get("rooms") || "1", 10));
  const roomPackageName = searchParams.get("roomPackage") || undefined;
  const roomMealType = searchParams.get("roomMealType") || undefined;
  const roomTotalPrice = searchParams.get("roomTotal")
    ? parseFloat(searchParams.get("roomTotal")!)
    : undefined;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/offers/${id}/checkout?${searchParams.toString()}`);
      return;
    }
    fetch(`/api/offers/${id}`)
      .then((r) => r.json())
      .then((d) => setOffer(d.offer))
      .finally(() => setLoading(false));
  }, [id, user, authLoading, router, searchParams]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2577be] border-t-transparent" />
      </div>
    );
  }

  if (!offer || !checkIn || !checkOut) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-500">Missing booking details. Please select dates first.</p>
        <Link href={`/offers/${id}`} className="mt-4 inline-block text-[#2577be] hover:underline">
          Back to offer
        </Link>
      </div>
    );
  }

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const baseTotal =
    roomTotalPrice && offer.type === "HOTEL"
      ? roomTotalPrice
      : offer.type === "HOTEL"
        ? offer.price * nights * rooms
        : offer.type === "CAR_RENTAL"
          ? offer.price * nights
          : offer.price * guests;
  const totalPrice = applySalePrice(baseTotal, offer.id, offer.stars);

  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Link
        href={`/offers/${id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#2577be] hover:underline"
      >
        <ArrowLeft size={16} /> Back to property
      </Link>

      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Step 1 of 2</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1e2e5e] md:text-3xl">Enter your details</h1>
        <p className="mt-2 text-slate-500">
          Almost there — the property needs guest information before we can confirm your reservation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="order-2 lg:order-1 lg:col-span-2">
          <BookingCheckoutForm
            offer={offer}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            rooms={rooms}
            roomPackageName={roomPackageName}
            roomMealType={roomMealType}
            roomTotalPrice={roomTotalPrice}
          />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <BookingOrderSummary
              offer={offer}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              rooms={rooms}
              totalPrice={totalPrice}
              nights={nights}
              roomPackageName={roomPackageName}
              roomMealType={roomMealType}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <SiteChrome>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2577be] border-t-transparent" />
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </SiteChrome>
  );
}
