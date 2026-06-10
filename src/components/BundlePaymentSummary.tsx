"use client";

import { Plane, Building2 } from "lucide-react";
import { formatUsd } from "@/lib/pricing";
import type { Booking } from "@/lib/types";

export default function BundlePaymentSummary({
  flightBooking,
  hotelBooking,
}: {
  flightBooking: Booking;
  hotelBooking: Booking;
}) {
  const total = flightBooking.totalPrice + hotelBooking.totalPrice;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-[#1e2e5e] px-5 py-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Flight + Hotel</p>
        <p className="mt-1 text-2xl font-bold">{formatUsd(total)}</p>
      </div>
      <div className="space-y-3 p-5 text-sm">
        <div className="flex items-start gap-3">
          <Plane size={16} className="mt-0.5 shrink-0 text-[#2D83C2]" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#1e2e5e]">{flightBooking.offer.title}</p>
            <p className="text-xs text-gray-500">{flightBooking.offer.location}</p>
          </div>
          <p className="font-semibold text-[#1e2e5e]">{formatUsd(flightBooking.totalPrice)}</p>
        </div>
        <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
          <Building2 size={16} className="mt-0.5 shrink-0 text-[#2D83C2]" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#1e2e5e] line-clamp-2">{hotelBooking.offer.title}</p>
            <p className="text-xs text-gray-500">
              {hotelBooking.checkIn?.slice(0, 10)} → {hotelBooking.checkOut?.slice(0, 10)}
            </p>
          </div>
          <p className="font-semibold text-[#1e2e5e]">{formatUsd(hotelBooking.totalPrice)}</p>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="font-semibold text-[#1e2e5e]">Total</span>
          <span className="text-xl font-bold text-[#1e2e5e]">{formatUsd(total)}</span>
        </div>
      </div>
    </div>
  );
}
