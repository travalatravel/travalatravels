"use client";

import { useEffect, useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import type { Booking } from "@/lib/types";
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/types";
import { guestDisplayName, parseAdditionalGuests } from "@/lib/booking-guest";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("");

  const load = () => {
    const url = filter ? `/api/admin/bookings?paymentStatus=${filter}` : "/api/admin/bookings";
    fetch(url).then((r) => r.json()).then((d) => setBookings(d.bookings || []));
  };

  useEffect(() => { load(); }, [filter]);

  const updatePayment = async (id: string, paymentStatus: string) => {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    });
    load();
  };

  const filters = ["", "PENDING", "AWAITING_CONFIRMATION", "PAID", "FAILED"];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e2e5e]">Bookings</h1>
          <p className="mt-1 text-gray-500">{bookings.length} bookings</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        {filters.map((f) => (
          <button
            key={f || "all"}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === f ? "bg-[#2577be] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f ? PAYMENT_STATUS_LABELS[f as keyof typeof PAYMENT_STATUS_LABELS] : "All"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_COLORS[b.paymentStatus]}`}>
                    {PAYMENT_STATUS_LABELS[b.paymentStatus]}
                  </span>
                  <span className="text-xs text-gray-400">#{b.id.slice(-8)}</span>
                </div>
                <h3 className="mt-2 font-semibold text-[#1e2e5e]">{b.offer?.title}</h3>
                <p className="text-sm text-gray-500">
                  Account: {b.user?.name} ({b.user?.email}) · {b.paymentMethod.replace("CRYPTO_", "")}
                </p>
                {b.guestFirstName && (
                  <p className="mt-1 text-sm text-[#1e2e5e]">
                    Lead guest: {guestDisplayName(b)}
                    {b.bookingType === "BUSINESS" && b.companyName ? ` · ${b.companyName}` : ""}
                  </p>
                )}
                {b.contactPhone && (
                  <p className="text-xs text-gray-500">{b.contactEmail} · {b.contactPhone}</p>
                )}
                {b.addressLine1 && (
                  <p className="text-xs text-gray-500">
                    {b.addressLine1}, {b.addressPostalCode} {b.addressCity}, {b.addressCountry}
                  </p>
                )}
                {parseAdditionalGuests(b.additionalGuests).length > 0 && (
                  <p className="text-xs text-gray-500">
                    +{parseAdditionalGuests(b.additionalGuests).length} additional guest(s)
                  </p>
                )}
                {b.specialRequests && (
                  <p className="mt-1 text-xs italic text-gray-500">Note: {b.specialRequests}</p>
                )}
                {b.txHash && (
                  <p className="mt-1 font-mono text-xs text-gray-400 break-all">TX: {b.txHash}</p>
                )}
                {b.wallet && (
                  <p className="mt-1 text-xs text-gray-400">
                    Wallet: {b.wallet.currency} — {b.wallet.address.slice(0, 12)}...
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#2577be]">${b.totalPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleString()}</p>
                {b.paidAt && <p className="text-xs text-green-600">Paid: {new Date(b.paidAt).toLocaleString()}</p>}
              </div>
            </div>

            {b.paymentStatus !== "PAID" && (
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => updatePayment(b.id, "PAID")}
                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                >
                  <Check size={14} /> Mark as Paid
                </button>
                <button
                  onClick={() => updatePayment(b.id, "FAILED")}
                  className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                >
                  <X size={14} /> Mark Failed
                </button>
              </div>
            )}
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center text-gray-400 shadow-sm">No bookings found</div>
        )}
      </div>
    </div>
  );
}
