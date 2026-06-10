"use client";

import OfferImage from "@/components/OfferImage";
import { formatUsd } from "@/lib/pricing";
import type { Offer } from "@/lib/types";
import { parseFlightBookingMeta } from "@/lib/flight-route";
import { useTranslations } from "@/i18n/useTranslations";
import { MapPin, Calendar, Users, BedDouble, Plane } from "lucide-react";
import type { CabinClass, TripType } from "@/lib/flight-types";

export default function BookingOrderSummary({
  offer,
  checkIn,
  checkOut,
  guests,
  rooms,
  totalPrice,
  nights,
  roomPackageName,
  roomMealType,
  cabin,
  trip,
  specialRequests,
}: {
  offer: Offer;
  checkIn?: string;
  checkOut?: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  nights?: number;
  roomPackageName?: string;
  roomMealType?: string;
  cabin?: CabinClass;
  trip?: TripType;
  specialRequests?: string | null;
}) {
  const { messages: m, fmt } = useTranslations();
  const p = m.paymentPage;
  const isFlight = offer.type === "FLIGHT";
  const flightMeta = isFlight ? parseFlightBookingMeta(specialRequests) : null;
  const flightRoute =
    flightMeta?.route ||
    (flightMeta?.fromCode && flightMeta?.toCode
      ? `${flightMeta.fromCode} → ${flightMeta.toCode}`
      : offer.location);

  const guestLabel =
    guests > 1
      ? isFlight
        ? p.passengers
        : p.guests
      : isFlight
        ? p.passenger
        : p.guest;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {!isFlight && (
        <div className="relative h-36">
          <OfferImage
            src={offer.image}
            alt={offer.title}
            metadata={offer.metadata}
            offerType={offer.type}
            city={offer.city}
            country={offer.country}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className={isFlight ? "p-5" : "p-5"}>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#2577be]">
          {m.offerTypes[offer.type]}
        </span>
        <h3 className="mt-1 font-semibold text-[#1e2e5e] leading-snug">{offer.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          {isFlight ? <Plane size={12} /> : <MapPin size={12} />}
          {isFlight ? flightRoute : offer.location}
        </p>

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          {checkIn && (
            <div className="flex items-start gap-2 text-gray-600">
              <Calendar size={15} className="mt-0.5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">{p.checkInOut}</p>
                <p className="font-medium text-[#1e2e5e]">
                  {new Date(checkIn).toLocaleDateString()}
                  {checkOut && ` → ${new Date(checkOut).toLocaleDateString()}`}
                </p>
                {nights && (
                  <p className="text-xs text-gray-500">{fmt(p.nights, { count: nights })}</p>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={15} className="text-gray-400" />
            <span>
              {guests} {guestLabel}
            </span>
          </div>
          {offer.type === "HOTEL" && (
            <div className="flex items-center gap-2 text-gray-600">
              <BedDouble size={15} className="text-gray-400" />
              <span>
                {rooms} {rooms > 1 ? m.common.rooms : m.common.room}
              </span>
            </div>
          )}
          {roomPackageName && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm">
              <p className="text-xs text-gray-400">{p.roomType}</p>
              <p className="font-medium text-[#1e2e5e]">{roomPackageName}</p>
              {roomMealType && <p className="text-xs text-gray-500">{roomMealType}</p>}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="font-semibold text-[#1e2e5e]">{m.orderSummary.total}</span>
          <span className="text-2xl font-bold text-[#1e2e5e]">{formatUsd(totalPrice)}</span>
        </div>
        <p className="mt-1 text-[10px] text-gray-400">{p.bestPriceGuarantee}</p>
      </div>
    </div>
  );
}
