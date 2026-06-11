"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Clock, MapPin, Phone, Wifi } from "lucide-react";
import type { OfferDetailsData, OfferRoomOption } from "@/lib/travala-details";
import { getOfferPricing, formatUsd } from "@/lib/pricing";
import { useTranslations } from "@/i18n/useTranslations";

type Props = {
  offerId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  fallbackDescription: string;
  selectedRoomId?: string | null;
  onSelectRoom?: (room: OfferRoomOption) => void;
  onRoomsLoaded?: (rooms: OfferRoomOption[]) => void;
  hideRooms?: boolean;
};

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 max-w-full border-t border-gray-100 pt-5 sm:pt-6">
      <h2 className="text-base font-bold text-[#1a1a1a] sm:text-lg">{title}</h2>
      <div className="mt-3 min-w-0 max-w-full text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

export default function OfferDetails({
  offerId,
  checkIn,
  checkOut,
  guests,
  rooms,
  fallbackDescription,
  selectedRoomId,
  onSelectRoom,
  onRoomsLoaded,
  hideRooms = false,
}: Props) {
  const { messages: m, fmt } = useTranslations();
  const [details, setDetails] = useState<OfferDetailsData | null>(null);
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
      .then((data) => setDetails(data.details || null))
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
  }, [offerId, checkIn, checkOut, guests, rooms]);

  useEffect(() => {
    if (!details?.rooms?.length) return;
    onRoomsLoaded?.(details.rooms);
  }, [details?.rooms, onRoomsLoaded]);

  const description = details?.description || fallbackDescription;

  if (loading && !details) {
    return (
      <div className="mt-6 space-y-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="mt-6 min-w-0 max-w-full space-y-0 overflow-hidden">
      {(details?.address || details?.phone) && (
        <div className="mb-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:gap-4">
          {details.address && (
            <span className="flex min-w-0 items-start gap-1.5 break-words">
              <MapPin size={15} className="mt-0.5 flex-shrink-0 text-[#2D83C2]" />
              {details.address}
            </span>
          )}
          {details.phone && (
            <span className="flex min-w-0 items-center gap-1.5">
              <Phone size={15} className="flex-shrink-0 text-[#2D83C2]" />
              {details.phone}
            </span>
          )}
        </div>
      )}

      <SectionBlock title={m.offerDetails.description}>
        <p className="whitespace-pre-line break-words">{description}</p>
      </SectionBlock>

      {(details?.checkIn || details?.checkOut) && (
        <SectionBlock title={m.offerDetails.checkInOut}>
          <div className="flex flex-wrap gap-6">
            {details.checkIn && (
              <div className="flex items-start gap-2">
                <Clock size={16} className="mt-0.5 text-[#2D83C2]" />
                <div>
                  <p className="font-medium text-[#1a1a1a]">{m.common.checkIn}</p>
                  <p>
                    {details.checkIn.from && fmt(m.offerDetails.fromTime, { time: details.checkIn.from })}
                    {details.checkIn.to && ` · ${fmt(m.offerDetails.untilTime, { time: details.checkIn.to })}`}
                  </p>
                </div>
              </div>
            )}
            {details.checkOut?.until && (
              <div className="flex items-start gap-2">
                <Clock size={16} className="mt-0.5 text-[#2D83C2]" />
                <div>
                  <p className="font-medium text-[#1a1a1a]">{m.common.checkOut}</p>
                  <p>{fmt(m.offerDetails.untilTime, { time: details.checkOut.until })}</p>
                </div>
              </div>
            )}
          </div>
        </SectionBlock>
      )}

      {details?.amenities && details.amenities.length > 0 && (
        <SectionBlock title={m.offerDetails.amenities}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {details.amenities.map((name) => (
              <li key={name} className="flex items-center gap-2">
                <Wifi size={14} className="shrink-0 text-[#2D83C2]" />
                {name}
              </li>
            ))}
          </ul>
        </SectionBlock>
      )}

      {!hideRooms && details?.rooms && details.rooms.length > 0 && (
        <SectionBlock title={m.offerDetails.availableRooms}>
          <p className="mb-4 text-sm text-gray-500">{m.offerDetails.selectRoomHint}</p>
          <div className="space-y-3">
            {details.rooms.map((room) => {
              const selected = selectedRoomId === room.id;
              const nightPricing = getOfferPricing(room.pricePerNight);
              const totalPricing = getOfferPricing(room.totalPrice);
              return (
              <button
                key={room.id}
                type="button"
                onClick={() => onSelectRoom?.(room)}
                className={`w-full min-w-0 max-w-full rounded-xl border p-3 text-left transition sm:p-4 ${
                  selected
                    ? "border-[#2D83C2] bg-blue-50 ring-2 ring-[#2D83C2]/20"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-[#1a1a1a]">{room.packageName}</p>
                    {room.bedDescription && (
                      <p className="mt-0.5 break-words text-xs text-gray-500">{room.bedDescription}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 sm:text-right">
                    <p className="text-base font-bold text-[#2D83C2] sm:text-lg">
                      {formatUsd(nightPricing.salePrice)}
                      <span className="text-xs font-normal text-gray-400">{m.common.perNight}</span>
                    </p>
                    <p className="text-xs text-gray-400 line-through">{formatUsd(nightPricing.originalPrice)}</p>
                    <p className="text-xs text-gray-500">
                      {formatUsd(totalPricing.salePrice)} {m.common.totalLabel}
                      <span className="text-gray-400"> · {fmt(m.common.wasPrice, { price: formatUsd(totalPricing.originalPrice) })}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {room.mealType && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-gray-600">{room.mealType}</span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      room.refundable ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {room.refundable ? m.common.refundable : m.common.nonRefundable}
                  </span>
                </div>
                {room.amenities.length > 0 && (
                  <p className="mt-2 break-words text-xs text-gray-500">{room.amenities.join(" · ")}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs font-semibold ${selected ? "text-[#2D83C2]" : "text-gray-400"}`}>
                    {selected ? m.common.selected : m.offerDetails.selectThisRoom}
                  </span>
                  {selected && <Check size={18} className="text-[#2D83C2]" />}
                </div>
              </button>
            );
            })}
          </div>
        </SectionBlock>
      )}

      {details?.policies && details.policies.length > 0 && (
        <SectionBlock title={m.offerDetails.propertyPolicies}>
          <ul className="list-disc space-y-1 pl-5">
            {details.policies.map((policy) => (
              <li key={policy}>{policy}</li>
            ))}
          </ul>
        </SectionBlock>
      )}

      {details?.sections.map((section) => (
        <SectionBlock key={section.title} title={section.title}>
          {section.html ? (
            <div
              className="offer-rich-content prose prose-sm max-w-none prose-ul:my-2 prose-li:my-0 prose-img:max-w-full prose-img:h-auto"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          ) : (
            <p className="whitespace-pre-line">{section.content}</p>
          )}
        </SectionBlock>
      ))}
    </div>
  );
}
