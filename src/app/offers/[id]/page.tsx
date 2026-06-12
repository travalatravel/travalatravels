"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import type { OfferRoomOption } from "@/lib/travala-details";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import OfferGallery from "@/components/OfferGallery";
import OfferDetails from "@/components/OfferDetails";
import OfferRoomPicker from "@/components/OfferRoomPicker";
import HotelFlightBundle from "@/components/HotelFlightBundle";
import { Star, MapPin, ArrowLeft, Plane } from "lucide-react";
import FlightOfferDetails from "@/components/FlightOfferDetails";
import { parseFlightMetadata, priceForFlight } from "@/lib/flight-display";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { CABIN_LABELS } from "@/lib/flight-types";
import SiteChrome from "@/components/SiteChrome";
import PriceDisplay from "@/components/PriceDisplay";
import type { Offer } from "@/lib/types";
import { offerTypeLabel } from "@/i18n/display-labels";
import type { LivePriceResult } from "@/lib/travala-price";
import { defaultStayDates } from "@/lib/travala-price";
import { applySalePrice, getOfferPricing, formatUsd } from "@/lib/pricing";
import {
  appendBundleFlightParams,
  BUNDLE_HOTEL_EXTRA_DISCOUNT_PCT,
  type BundleFlightSelection,
} from "@/lib/flight-hotel-bundle";
import { Tag } from "lucide-react";
import { useTranslations } from "@/i18n/useTranslations";

function OfferDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { messages: m, fmt } = useTranslations();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [livePrice, setLivePrice] = useState<LivePriceResult | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<OfferRoomOption | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<BundleFlightSelection | null>(null);
  const [error, setError] = useState("");

  const trip = (searchParams.get("trip") || "roundtrip") as TripType;
  const cabin = (searchParams.get("cabin") || "economy") as CabinClass;
  const adults = Math.max(1, parseInt(searchParams.get("adults") || "1", 10));
  const children = Math.max(0, parseInt(searchParams.get("children") || "0", 10));
  const infants = Math.max(0, parseInt(searchParams.get("infants") || "0", 10));
  const flightPax = adults + children + infants;

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
        const urlDepart = searchParams.get("depart");
        const urlReturn = searchParams.get("return");
        if (data.offer?.type === "FLIGHT" && urlDepart) {
          setCheckIn(urlDepart);
          setCheckOut(urlReturn || urlDepart);
          setGuests(adults + children + infants);
        } else {
          const defaults = defaultStayDates();
          setCheckIn(defaults.checkIn);
          setCheckOut(defaults.checkOut);
        }
      })
      .finally(() => setLoading(false));
  }, [id, searchParams, adults, children, infants]);

  useEffect(() => {
    if (!offer || offer.type === "FLIGHT" || !checkIn || !checkOut) return;
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
    if (offer.type === "FLIGHT") {
      return priceForFlight(offer.price, cabin, flightPax, trip);
    }
    return offer.price * guests;
  };

  const calcTotal = () => {
    if (!offer) return 0;
    return applySalePrice(calcBaseTotal(), offer.id, offer.stars);
  };

  const displayPricePerNight =
    selectedRoom?.pricePerNight ??
    livePrice?.pricePerNight ??
    (offer?.type === "FLIGHT" && offer
      ? priceForFlight(offer.price, cabin, 1, trip)
      : offer?.price ?? 0);
  const pricing = offer ? getOfferPricing(displayPricePerNight, offer.id, offer.stars) : null;
  const totalPricing = offer ? getOfferPricing(calcBaseTotal()) : null;
  const bundleHotelTotal = selectedFlight
    ? Math.round(calcTotal() * (1 - BUNDLE_HOTEL_EXTRA_DISCOUNT_PCT / 100) * 100) / 100
    : calcTotal();
  const bundleTotal = selectedFlight
    ? bundleHotelTotal + selectedFlight.flightTotal
    : calcTotal();

  const handleContinue = () => {
    if (!offer) return;
    if (!checkIn || !checkOut) {
      setError(m.offerPage.selectDates);
      return;
    }
    if (offer.type === "HOTEL" && !selectedRoom) {
      setError(m.offerPage.selectRoomType);
      return;
    }
    const params = new URLSearchParams({
      checkIn,
      checkOut: checkOut || checkIn,
      guests: String(offer.type === "FLIGHT" ? flightPax : guests),
      rooms: String(rooms),
    });
    if (offer.type === "FLIGHT") {
      params.set("depart", checkIn);
      if (trip === "roundtrip" && checkOut) params.set("return", checkOut);
      params.set("trip", trip);
      params.set("cabin", cabin);
      params.set("adults", String(adults));
      params.set("children", String(children));
      params.set("infants", String(infants));
    }
    if (selectedRoom) {
      params.set("roomId", selectedRoom.id);
      params.set("roomPackage", selectedRoom.packageName);
      params.set("roomTotal", String(selectedRoom.totalPrice));
      params.set("roomPricePerNight", String(selectedRoom.pricePerNight));
      if (selectedRoom.mealType) params.set("roomMealType", selectedRoom.mealType);
    }
    if (selectedFlight) {
      appendBundleFlightParams(params, selectedFlight);
    }
    router.push(`/offers/${id}/checkout?${params}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2D83C2] border-t-transparent" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{m.offerPage.offerNotFound}</p>
        <Link href="/search" className="text-[#2D83C2] hover:underline">{m.checkout.backToSearch}</Link>
      </div>
    );
  }

  const flightMeta = offer.type === "FLIGHT" ? parseFlightMetadata(offer.metadata) : null;
  const isFlight = offer.type === "FLIGHT";

  return (
    <>
      <SiteChrome>
      <div className="w-full min-w-0 overflow-x-hidden">
      <main className="mx-auto w-full min-w-0 max-w-6xl px-3 py-6 pb-28 sm:px-4 sm:py-8 lg:px-6 lg:pb-8">
        <Link href="/search" className="mb-4 inline-flex items-center gap-1 text-sm text-[#2D83C2] hover:underline sm:mb-6">
          <ArrowLeft size={16} /> {m.checkout.backToSearch}
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
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              rooms={rooms}
            />
            <div className="mt-4 min-w-0 sm:mt-6">
              <span className="rounded-full bg-[#2D83C2]/10 px-3 py-1 text-xs font-semibold text-[#2D83C2]">
                {offerTypeLabel(m, offer.type)}
              </span>
              <h1 className="mt-3 break-words text-lg font-bold text-[#1a1a1a] sm:text-2xl md:text-3xl">
                {isFlight && flightMeta?.airline ? `${flightMeta.airline} · ${flightMeta.from} → ${flightMeta.to}` : offer.title}
              </h1>
              <div className="mt-2 flex min-w-0 items-start gap-1 text-sm text-gray-500">
                {isFlight ? <Plane size={16} className="mt-0.5 flex-shrink-0" /> : <MapPin size={16} className="mt-0.5 flex-shrink-0" />}
                <span className="break-words">{isFlight ? `${flightMeta?.from || offer.city} ${m.common.routeTo} ${flightMeta?.to || offer.country}` : offer.location}</span>
              </div>
              {offer.stars && !isFlight && (
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: offer.stars }).map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
              {isFlight && flightMeta ? (
                <FlightOfferDetails
                  offerId={offer.id}
                  meta={flightMeta}
                  cabin={cabin}
                  trip={trip}
                  depart={checkIn}
                  returnDate={trip === "roundtrip" ? checkOut : undefined}
                />
              ) : (
                <>
                  <div className="mt-4">
                    <OfferRoomPicker
                      offerId={offer.id}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      guests={guests}
                      rooms={rooms}
                      selectedRoomId={selectedRoom?.id ?? null}
                      onSelectRoom={setSelectedRoom}
                      onRoomsLoaded={handleRoomsLoaded}
                    />
                  </div>
                  <OfferDetails
                    offerId={offer.id}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guests}
                    rooms={rooms}
                    fallbackDescription={offer.description}
                    hideRooms
                  />
                  <HotelFlightBundle
                    destinationCity={offer.city}
                    destinationCountry={offer.country}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guests}
                    selectedFlightToken={selectedFlight?.token ?? null}
                    onSelectFlight={setSelectedFlight}
                  />
                </>
              )}
            </div>
          </div>

          <div className="order-1 min-w-0 lg:order-2 lg:col-span-1">
            <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl lg:sticky lg:top-20">
              {pricing && pricing.discountPct > 0 && (
                <div className="flex items-center gap-2 bg-[#2D83C2] px-3 py-2.5 text-white sm:px-4">
                  <Tag size={14} className="flex-shrink-0" />
                  <span className="text-xs font-semibold sm:text-sm">
                    {fmt(m.common.savePctGuarantee, { pct: pricing.discountPct })}
                  </span>
                </div>
              )}
              <div className="min-w-0 p-3 sm:p-6">
              {livePrice?.source === "travala" && (
                <span className="mb-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  {m.offerPage.liveRateLocked}
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
                <div className="mt-3 min-w-0 rounded-xl border border-[#2D83C2]/20 bg-blue-50/50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2D83C2]">{m.offerPage.selectedRoom}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-[#1a1a1a]">{selectedRoom.packageName}</p>
                  {selectedRoom.bedDescription && (
                    <p className="text-xs text-gray-500">{selectedRoom.bedDescription}</p>
                  )}
                  {selectedRoom.mealType && (
                    <p className="mt-1 text-xs text-gray-500">
                      {selectedRoom.mealType}
                      {selectedRoom.refundable ? m.offerPage.refundableSuffix : m.offerPage.nonRefundableSuffix}
                    </p>
                  )}
                </div>
              ) : (
                offer.type === "HOTEL" && (
                  <p className="mt-2 text-xs text-[#2D83C2]">{m.offerPage.selectRoomBelow}</p>
                )
              )}
              {!selectedRoom && livePrice?.mealType && (
                <p className="mt-1 text-xs text-gray-500">{livePrice.mealType}{livePrice.refundable ? m.offerPage.refundableSuffix : ""}</p>
              )}

              <div className="mt-4 min-w-0 space-y-3 sm:mt-5">
                {isFlight && (
                  <div className="rounded-xl border border-[#2D83C2]/15 bg-blue-50/40 p-3 text-sm">
                    <p className="font-semibold text-[#1a1a1a]">{m.search.cabin[cabin === "premium_economy" ? "premiumEconomy" : cabin as "economy" | "business" | "first"]}</p>
                    <p className="text-xs text-gray-500">
                      {fmt(m.search.passengersLine, {
                        count: flightPax,
                        passengerLabel: flightPax === 1 ? m.common.passenger : m.common.passengers,
                      })}{" "}
                      · {m.search.tripTypes[trip === "multicity" ? "multicity" : trip]}
                    </p>
                  </div>
                )}
                {(offer.type === "HOTEL" || offer.type === "CAR_RENTAL") && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className="text-xs font-medium text-gray-500">{m.common.checkIn}</label>
                      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                        className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#2D83C2] sm:px-3 sm:py-2.5" />
                    </div>
                    <div className="min-w-0">
                      <label className="text-xs font-medium text-gray-500">{m.common.checkOut}</label>
                      <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                        className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#2D83C2] sm:px-3 sm:py-2.5" />
                    </div>
                  </div>
                )}
                {isFlight && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className="text-xs font-medium text-gray-500">{m.common.depart}</label>
                      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                        className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#2D83C2] sm:px-3 sm:py-2.5" />
                    </div>
                    {trip === "roundtrip" && (
                      <div className="min-w-0">
                        <label className="text-xs font-medium text-gray-500">{m.common.return}</label>
                        <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)}
                          className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#2D83C2] sm:px-3 sm:py-2.5" />
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label className="text-xs font-medium text-gray-500">{isFlight ? m.common.passengers : m.common.guests}</label>
                    <input type="number" min={1} max={20} value={isFlight ? flightPax : guests} disabled={isFlight}
                      onChange={(e) => setGuests(+e.target.value)}
                      className="mt-1 w-full min-w-0 rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#2D83C2] disabled:bg-gray-50 sm:px-3 sm:py-2.5" />
                  </div>
                  {offer.type === "HOTEL" && (
                    <div className="min-w-0">
                      <label className="text-xs font-medium text-gray-500">{m.common.rooms}</label>
                      <input type="number" min={1} max={10} value={rooms} onChange={(e) => setRooms(+e.target.value)}
                        className="mt-1 w-full min-w-0 rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#2D83C2] sm:px-3 sm:py-2.5" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 min-w-0 rounded-xl border border-[#2D83C2]/15 bg-[#2D83C2]/5 p-3 sm:mt-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold text-[#1a1a1a] sm:text-base">
                    {selectedFlight ? m.bundle.hotelPlusFlight : m.offerPage.yourPrice}
                    {livePrice?.nights || isFlight
                      ? fmt(m.offerPage.nightsAndPax, {
                          nights: livePrice?.nights ?? 0,
                          pax: isFlight ? flightPax : guests,
                        })
                      : ""}
                  </span>
                  <span className={`text-xl font-bold text-[#1a1a1a] sm:text-2xl ${priceLoading ? "opacity-50" : ""}`}>
                    {priceLoading ? "…" : formatUsd(selectedFlight ? bundleTotal : calcTotal())}
                  </span>
                </div>
                {selectedFlight && (
                  <p className="mt-1 text-xs text-emerald-700">{m.bundle.bundleSavings}</p>
                )}
                {totalPricing && totalPricing.savings > 0 && (
                  <p className="mt-1 break-words text-xs text-[#2D83C2]">
                    {fmt(m.offerPage.wasSaving, {
                      save: formatUsd(totalPricing.savings),
                      was: formatUsd(calcBaseTotal()),
                    })}
                  </p>
                )}
              </div>

              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

              <button
                onClick={handleContinue}
                className="mt-4 hidden w-full rounded-xl bg-[#2D83C2] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#1a5f94] sm:block sm:py-4"
              >
                {isFlight ? m.common.continuePassengers : m.offerPage.continueGuestDetails}
              </button>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                {isFlight ? m.common.fareRules : m.offerPage.freeCancellationHint}
              </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex w-full min-w-0 max-w-6xl items-center gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-gray-500">{m.offerPage.yourPrice}</p>
            <p className="text-lg font-bold text-[#1a1a1a]">
              {priceLoading ? "…" : formatUsd(selectedFlight ? bundleTotal : calcTotal())}
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="flex-shrink-0 rounded-xl bg-[#2D83C2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1a5f94] sm:px-5 sm:py-3"
          >
            {m.offerPage.bookArrow}
          </button>
        </div>
      </div>

      </SiteChrome>
    </>
  );
}

export default function OfferDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2D83C2] border-t-transparent" />
        </div>
      }
    >
      <OfferDetailContent />
    </Suspense>
  );
}
