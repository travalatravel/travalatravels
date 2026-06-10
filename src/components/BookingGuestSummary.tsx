import {
  guestDisplayName,
  parseAdditionalGuests,
  type BookingType,
} from "@/lib/booking-guest";
import { Building2, User, Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";

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
  const extra = parseAdditionalGuests(booking.additionalGuests);
  const type = (booking.bookingType as BookingType) || "PRIVATE";
  const address = [
    booking.addressLine1,
    booking.addressLine2,
    [booking.addressPostalCode, booking.addressCity].filter(Boolean).join(" "),
    booking.addressCountry,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
      <h3 className="text-sm font-semibold text-[#1e2e5e]">Guest &amp; billing details</h3>
      <div className="mt-4 space-y-4">
        <Row
          icon={type === "BUSINESS" ? Building2 : User}
          label={type === "BUSINESS" ? "Business booking" : "Private booking"}
          value={guestDisplayName(booking)}
        />
        {type === "BUSINESS" && booking.companyName && (
          <Row icon={Building2} label="Company" value={`${booking.companyName}${booking.companyVatId ? ` · VAT ${booking.companyVatId}` : ""}`} />
        )}
        <Row icon={Mail} label="Email" value={booking.contactEmail} />
        <Row icon={Phone} label="Phone" value={booking.contactPhone} />
        <Row icon={MapPin} label="Address" value={address} />
        <Row icon={Clock} label="Estimated arrival" value={booking.estimatedArrival} />
        {extra.length > 0 && (
          <div className="flex gap-3 text-sm">
            <User size={15} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Additional guests ({extra.length})
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Registered for property check-in — names must match ID on arrival.
              </p>
              <ul className="mt-2 space-y-0.5 text-slate-800">
                {extra.map((g, i) => (
                  <li key={i}>
                    {g.firstName} {g.lastName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {booking.specialRequests && (
          <Row icon={MessageSquare} label="Special requests" value={booking.specialRequests} />
        )}
      </div>
    </div>
  );
}
