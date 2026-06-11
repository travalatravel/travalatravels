"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { OfferRoomOption } from "@/lib/travala-details";
import { getOfferPricing, formatUsd } from "@/lib/pricing";
import { useTranslations } from "@/i18n/useTranslations";

export default function OfferRoomPicker({
  offerId,
  checkIn,
  checkOut,
  guests,
  rooms,
  selectedRoomId,
  onSelectRoom,
  onRoomsLoaded,
}: {
  offerId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  selectedRoomId?: string | null;
  onSelectRoom?: (room: OfferRoomOption) => void;
  onRoomsLoaded?: (rooms: OfferRoomOption[]) => void;
}) {
  const { messages: m } = useTranslations();
  const [roomList, setRoomList] = useState<OfferRoomOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!offerId || !checkIn || !checkOut) return;
    setLoading(true);
    const params = new URLSearchParams({
      offerId,
      checkIn,
      checkOut,
      guests: String(guests),
      rooms: String(rooms),
    });
    fetch(`/api/offer-details?${params}`)
      .then((r) => r.json())
      .then((data) => setRoomList(data.details?.rooms || []))
      .catch(() => setRoomList([]))
      .finally(() => setLoading(false));
  }, [offerId, checkIn, checkOut, guests, rooms]);

  useEffect(() => {
    if (roomList.length) onRoomsLoaded?.(roomList);
  }, [roomList, onRoomsLoaded]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!roomList.length) return null;

  return (
    <section className="min-w-0">
      <h2 className="text-base font-bold text-[#1a1a1a]">{m.offerDetails.availableRooms}</h2>
      <p className="mt-1 text-xs text-gray-500">{m.offerDetails.selectRoomHint}</p>
      <div className="mt-3 space-y-2">
        {roomList.map((room) => {
          const selected = selectedRoomId === room.id;
          const nightPricing = getOfferPricing(room.pricePerNight);
          const totalPricing = getOfferPricing(room.totalPrice);
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onSelectRoom?.(room)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                selected
                  ? "border-[#2D83C2] bg-blue-50 ring-1 ring-[#2D83C2]/30"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1a1a1a]">{room.packageName}</p>
                <p className="truncate text-[11px] text-gray-500">
                  {room.bedDescription || room.mealType || ""}
                  {room.refundable ? ` · ${m.common.refundable}` : ` · ${m.common.nonRefundable}`}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-[#2D83C2]">
                  {formatUsd(nightPricing.salePrice)}
                  <span className="text-[10px] font-normal text-gray-400">{m.common.perNight}</span>
                </p>
                <p className="text-[10px] text-gray-400">
                  {formatUsd(totalPricing.salePrice)} {m.common.totalLabel}
                </p>
              </div>
              {selected && <Check size={16} className="shrink-0 text-[#2D83C2]" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
