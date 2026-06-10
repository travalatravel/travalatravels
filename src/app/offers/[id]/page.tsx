"use client";

import { useCallback, useEffect, useState } from "react";
import type { OfferRoomOption } from "@/lib/travala-details";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import OfferGallery from "@/components/OfferGallery";
import OfferDetails from "@/components/OfferDetails";
import { Star, MapPin, ArrowLeft } from "lucide-react";
import SiteChrome from "@/components/SiteChrome";
import PriceDisplay from "@/components/PriceDisplay";
import { useAuth } from "@/context/AuthContext";
import type { Offer } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import type { LivePriceResult } from "@/lib/travala-price";
import { defaultStayDates } from "@/lib/travala-price";
import { CRYPTO_PAYMENT_METHODS, GATEWAY_NAME } from "@/lib/payments";
import CryptoMethodPicker from "@/components/CryptoMethodPicker";
import { applySalePrice, getOfferPricing, formatUsd } from "@/lib/pricing";
import { Tag } from "lucide-react";

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [livePrice, setLivePrice] = useState<LivePriceResult | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<(typeof CRYPTO_PAYMENT_METHODS)[number]>("CRYPTO_BTC");
  const [selectedRoom, setSelectedRoom] = useState<OfferRoomOption | null>(null);
  const [error, setError] = useState("");

  const handleRoomsLoaded = useCallback((roomList: OfferRoomOption[]) => {
    setSelectedRoom((prev) => {
      if (!roomList.length) return null;
      if (prev) {
        const match = roomList.find((r) => r.id === prev.id);
        if (match) return match;
      }
      return roomList[0];
    });
  }, []);

  useEffect(() => {
    fetch(`/api/offers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOffer(data.offer);
        const defaults = defaultStayDates();
        setCheckIn(defaults.checkIn);
        setCheckOut(defaults.checkOut);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!offer || !checkIn || !checkOut) return;
    setPriceLoading(true);
    const params = new URLSearchParams({
      offerId: offer.id,
      checkIn,
      checkOut,
      guests: String(guests),
      rooms: String(rooms),
    });
    fetch(`/api/offer-price?${params}`)
      .then((r) => r.json())
      .then((data) => setLivePrice(data))
      .catch(() => setLivePrice(null))
      .finally(() => setPriceLoading(false));
  }, [offer, checkIn, checkOut, guests, rooms]);

  const calcBaseTotal = () => {
    if (selectedRoom && offer?.type === "HOTEL") return selectedRoom.totalPrice;
    if (livePrice) return livePrice.totalPrice;
    if (!offer) return 0;
    let nights = 1;
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }
    if (offer.type === "HOTEL") return offer.price * nights * rooms;
    if (offer.type === "CAR_RENTAL") return offer.price * nights;
    return offer.price * guests;
  };

  const calcTotal = () => {
    if (!offer) return 0;
    return applySalePrice(calcBaseTotal(), offer.id, offer.stars);
  };

  const displayPricePerNight =
    selectedRoom?.pricePerNight ?? livePrice?.pricePerNight ?? offer?.price ?? 0;
  const pricing = offer ? getOfferPricing(displayPricePerNight, offer.id, offer.stars) : null;
  const totalPricing = offer ? getOfferPricing(calcBaseTotal()) : null;

  const handleContinue = () => {
    if (!offer) return;
    if (!user) {
      router.push(`/login?redirect=/offers/${id}`);
      return;
    }
    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates.");
      return;
    }
    if (offer.type === "HOTEL" && !selectedRoom) {
      setError("Please select a room type from the list below.");
      return;
    }
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
      rooms: String(rooms),
      paymentMethod,
    });
    if (selectedRoom) {
      params.set("roomId", selectedRoom.id);
      params.set("roomPackage", selectedRoom.packageName);
      params.set("roomTotal", String(selectedRoom.totalPrice));
      params.set("roomPricePerNight", String(selectedRoom.pricePerNight));
      if (selectedRoom.mealType) params.set("roomMealType", selectedRoom.mealType);
    }
    router.push(`/offers/${id}/checkout?${params}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2577be] border-t-transparent" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Offer not found</p>
        <Link href="/search" className="text-[#2577be] hover:underline">Back to search</Link>
      </div>
    );
  }

  return (
    <>
      <SiteChrome>
      <div className="w-full min-w-0 overflow-x-hidden">
      <main className="mx-auto w-full min-w-0 max-w-6xl px-3 py-6 pb-28 sm:px-4 sm:py-8 lg:px-6 lg:pb-8">
        <Link href="/search" className="mb-4 inline-flex items-center gap-1 text-sm text-[#2577be] hover:underline sm:mb-6">
          <ArrowLeft size={16} /> Back to search
        </Link>

        <div className="grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-2">
            <OfferGallery
              title={offer.title}
              fallbackImage={offer.image}
              metadata={offer.metadata}
              offerType={offer.type}
              city={offer.city}
              country={offer.country}
            />
            <div className="mt-4 min-w-0 sm:mt-6">
              <span className="rounded-full bg-[#2577be]/10 px-3 py-1 text-xs font-semibold text-[#2577be]">
                {TYPE_LABELS[offer.type]}
              </span>
              <h1 className="mt-3 break-words text-lg font-bold text-[#1e2e5e] sm:text-2xl md:text-3xl">{offer.title}</h1>
              <div className="mt-2 flex min-w-0 items-start gap-1 text-sm text-gray-500">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span className="break-words">{offer.location}</span>
              </div>
              {offer.stars && (
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: offer.stars }).map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
              <OfferDetails
                offerId={offer.id}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                rooms={rooms}
                fallbackDescription={offer.description}
                selectedRoomId={selectedRoom?.id ?? null}
                onSelectRoom={setSelectedRoom}
                onRoomsLoaded={handleRoomsLoaded}
              />
            </div>
          </div>

          <div className="order-1 min-w-0 lg:order-2 lg:col-span-1">
            <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl lg:sticky lg:top-20">
              {pricing && pricing.discountPct > 0 && (
                <div className="flex items-center gap-2 bg-[#2577be] px-3 py-2.5 text-white sm:px-4">
                  <Tag size={14} className="flex-shrink-0" />
                  <span className="text-xs font-semibold sm:text-sm">
                    Save {pricing.discountPct}% — Best price guarantee
                  </span>
                </div>
              )}
              <div className="min-w-0 p-3 sm:p-6">
              {livePrice?.source === "travala" && (
                <span className="mb-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Live rate · locked for 15 min
                </span>
              )}
              <div className={priceLoading ? "opacity-50" : ""}>
                {offer && (
                  <PriceDisplay
                    price={displayPricePerNight}
                    offerId={offer.id}
                    stars={offer.stars}
                    size="lg"
                    perNight={offer.type === "HOTEL"}
                    showCrypto
                  />
                )}
              </div>
              {selectedRoom ? (
                <div className="mt-3 min-w-0 rounded-xl border border-[#2577be]/20 bg-blue-50/50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2577be]">Selected room</p>
                  <p className="mt-1 break-words text-sm font-semibold text-[#1e2e5e]">{selectedRoom.packageName}</p>
                  {selectedRoom.bedDescription && (
                    <p className="text-xs text-gray-500">{selectedRoom.bedDescription}</p>
                  )}
                  {selectedRoom.mealType && (
                    <p className="mt-1 text-xs text-gray-500">
                      {selectedRoom.mealType}
                      {selectedRoom.refundable ? " · Refundable" : " · Non-refundable"}
                    </p>
                  )}
                </div>
              ) : (
                offer.type === "HOTEL" && (
                  <p className="mt-2 text-xs text-[#2577be]">Select a room type below to see your rate.</p>
                )
              )}
              {!selectedRoom && livePrice?.mealType && (
                <p className="mt-1 text-xs text-gray-500">{livePrice.mealType}{livePrice.refundable ? " · Refundable" : ""}</p>
              )}

              <div className="mt-4 min-w-0 space-y-3 sm:mt-5">
                {(offer.type === "HOTEL" || offer.type === "CAR_RENTAL") && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className="text-xs font-medium text-gray-500">Check-in</label>
                      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                        className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#2577be] sm:px-3 sm:py-2.5" />
                    </div>
                    <div className="min-w-0">
                      <label className="text-xs font-medium text-gray-500">Check-out</label>
                      <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                        className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#2577be] sm:px-3 sm:py-2.5" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label className="text-xs font-medium text-gray-500">Guests</label>
                    <input type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(+e.target.value)}
                      className="mt-1 w-full min-w-0 rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#2577be] sm:px-3 sm:py-2.5" />
                  </div>
                  {offer.type === "HOTEL" && (
                    <div className="min-w-0">
                      <label className="text-xs font-medium text-gray-500">Rooms</label>
                      <input type="number" min={1} max={10} value={rooms} onChange={(e) => setRooms(+e.target.value)}
                        className="mt-1 w-full min-w-0 rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#2577be] sm:px-3 sm:py-2.5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-medium text-gray-500">Payment method</label>
                  <p className="mt-0.5 mb-2 break-words text-[11px] text-gray-400">{GATEWAY_NAME}</p>
                  <CryptoMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
                </div>
              </div>

              <div className="mt-4 min-w-0 rounded-xl border border-[#2577be]/15 bg-[#2577be]/5 p-3 sm:mt-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold text-[#1e2e5e] sm:text-base">
                    Your price{livePrice?.nights ? ` · ${livePrice.nights} nights` : ""}
                  </span>
                  <span className={`text-xl font-bold text-[#1e2e5e] sm:text-2xl ${priceLoading ? "opacity-50" : ""}`}>
                    {priceLoading ? "…" : formatUsd(calcTotal())}
                  </span>
                </div>
                {totalPricing && totalPricing.savings > 0 && (
                  <p className="mt-1 break-words text-xs text-[#2577be]">
                    You save {formatUsd(totalPricing.savings)} (was {formatUsd(calcBaseTotal())})
                  </p>
                )}
              </div>

              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

              <button
                onClick={handleContinue}
                className="mt-4 hidden w-full rounded-xl bg-[#2577be] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#1e2e5e] sm:block sm:py-4"
              >
                {user ? "Continue — enter guest details →" : "Log in to book"}
              </button>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                Free cancellation on select rates · Price held for 15 minutes
              </p>
              </div>

              {!user && (
                <p className="mt-2 text-center text-xs text-gray-400">
                  <Link href={`/register?redirect=/offers/${id}`} className="text-[#2577be] hover:underline">
                    Create an account
                  </Link>{" "}
                  to book
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex w-full min-w-0 max-w-6xl items-center gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-gray-500">Your price</p>
            <p className="text-lg font-bold text-[#1e2e5e]">
              {priceLoading ? "…" : formatUsd(calcTotal())}
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="flex-shrink-0 rounded-xl bg-[#2577be] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1e2e5e] sm:px-5 sm:py-3"
          >
            {user ? "Book →" : "Log in"}
          </button>
        </div>
      </div>

      </SiteChrome>
    </>
  );
}
