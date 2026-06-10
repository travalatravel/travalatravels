import OfferImage from "@/components/OfferImage";
import { formatUsd } from "@/lib/pricing";
import type { Offer } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { MapPin, Calendar, Users, BedDouble } from "lucide-react";

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
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-36">
        <OfferImage
          src={offer.image}
          alt={offer.title}
          metadata={offer.metadata}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#2577be]">
          {TYPE_LABELS[offer.type]}
        </span>
        <h3 className="mt-1 font-semibold text-[#1e2e5e] leading-snug">{offer.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} />
          {offer.location}
        </p>

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          {checkIn && (
            <div className="flex items-start gap-2 text-gray-600">
              <Calendar size={15} className="mt-0.5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Check-in → Check-out</p>
                <p className="font-medium text-[#1e2e5e]">
                  {new Date(checkIn).toLocaleDateString()}
                  {checkOut && ` → ${new Date(checkOut).toLocaleDateString()}`}
                </p>
                {nights && <p className="text-xs text-gray-500">{nights} night{nights > 1 ? "s" : ""}</p>}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={15} className="text-gray-400" />
            <span>{guests} guest{guests > 1 ? "s" : ""}</span>
          </div>
          {offer.type === "HOTEL" && (
            <div className="flex items-center gap-2 text-gray-600">
              <BedDouble size={15} className="text-gray-400" />
              <span>{rooms} room{rooms > 1 ? "s" : ""}</span>
            </div>
          )}
          {roomPackageName && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm">
              <p className="text-xs text-gray-400">Room type</p>
              <p className="font-medium text-[#1e2e5e]">{roomPackageName}</p>
              {roomMealType && <p className="text-xs text-gray-500">{roomMealType}</p>}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="font-semibold text-[#1e2e5e]">Total</span>
          <span className="text-2xl font-bold text-emerald-700">{formatUsd(totalPrice)}</span>
        </div>
        <p className="mt-1 text-[10px] text-gray-400">Includes crypto discount · Taxes included</p>
      </div>
    </div>
  );
}
