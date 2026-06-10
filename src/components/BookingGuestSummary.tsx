"use client";

import {
  guestDisplayName,
  parseAdditionalGuests,
  type BookingType,
} from "@/lib/booking-guest";
import { parseFlightBookingMeta } from "@/lib/flight-route";
import { useTranslations } from "@/i18n/useTranslations";
import { Building2, User, Mail, Phone, MapPin, Clock, MessageSquare, Plane } from "lucide-react";

type GuestBooking = {
  bookingType?: string | null;
  guestFirstName?: string | null;
  guestLastName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressCity?: string | null;
  addressPostalCode?: string | null;
  addressCountry?: string | null;
  companyName?: string | null;
  companyVatId?: string | null;
  estimatedArrival?: string | null;
  specialRequests?: string | null;
  additionalGuests?: string | null;
  guests?: number;
};

function Row({ icon: Icon, label, value }: { icon: typeof User; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 text-sm">
      <Icon size={15} className="mt-0.5 flex-shrink-0 text-slate-400" />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function BookingGuestSummary({ booking }: { booking: GuestBooking }) {
  const { messages: m, fmt } = useTranslations();
  const g = m.guestSummary;
  const extra = parseAdditionalGuests(booking.additionalGuests);
  const type = (booking.bookingType as BookingType) || "PRIVATE";
  const flightMeta = parseFlightBookingMeta(booking.specialRequests);
  const userSpecialRequests =
    booking.specialRequests && !flightMeta ? booking.specialRequests : null;

  const address = [
    booking.addressLine1,
    booking.addressLine2,
    [booking.addressPostalCode, booking.addressCity].filter(Boolean).join(" "),
    booking.addressCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const flightRoute =
    flightMeta?.route ||
    (flightMeta?.fromCode && flightMeta?.toCode
      ? `${flightMeta.fromCode} → ${flightMeta.toCode}`
      : null);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
      <h3 className="text-sm font-semibold text-[#1a1a1a]">{g.title}</h3>
      <div className="mt-4 space-y-4">
        <Row
          icon={type === "BUSINESS" ? Building2 : User}
          label={type === "BUSINESS" ? g.businessBooking : g.privateBooking}
          value={guestDisplayName(booking)}
        />
        {type === "BUSINESS" && booking.companyName && (
          <Row
            icon={Building2}
            label={g.company}
            value={`${booking.companyName}${booking.companyVatId ? ` · ${g.vat} ${booking.companyVatId}` : ""}`}
          />
        )}
        <Row icon={Mail} label={g.email} value={booking.contactEmail} />
        <Row icon={Phone} label={g.phone} value={booking.contactPhone} />
        <Row icon={MapPin} label={g.address} value={address} />
        {flightMeta && (
          <>
            <Row icon={Plane} label={g.flight} value={flightMeta.airline} />
            {flightRoute && <Row icon={Plane} label={g.route} value={flightRoute} />}
            {flightMeta.departAt && (
              <Row
                icon={Clock}
                label={g.departure}
                value={new Date(flightMeta.departAt).toLocaleString()}
              />
            )}
          </>
        )}
        {!flightMeta && (
          <Row icon={Clock} label={g.estimatedArrival} value={booking.estimatedArrival} />
        )}
        {extra.length > 0 && (
          <div className="flex gap-3 text-sm">
            <User size={15} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                {fmt(g.additionalGuests, { count: extra.length })}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{g.additionalGuestsHint}</p>
              <ul className="mt-2 space-y-0.5 text-slate-800">
                {extra.map((guest, i) => (
                  <li key={i}>
                    {guest.firstName} {guest.lastName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {userSpecialRequests && (
          <Row icon={MessageSquare} label={g.specialRequests} value={userSpecialRequests} />
        )}
      </div>
    </div>
  );
}
