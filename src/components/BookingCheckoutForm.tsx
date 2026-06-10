"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CRYPTO_PAYMENT_METHODS, GATEWAY_NAME } from "@/lib/payments";
import CryptoMethodPicker from "@/components/CryptoMethodPicker";
import {
  ARRIVAL_SLOTS,
  COUNTRY_OPTIONS,
  type AdditionalGuest,
  type BookingType,
} from "@/lib/booking-guest";
import type { Offer } from "@/lib/types";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { useAuth } from "@/context/AuthContext";
import { Building2, User, ChevronRight, ShieldCheck, Info, Plus, Trash2 } from "lucide-react";

const inputCls =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2577be] focus:ring-2 focus:ring-[#2577be]/10";
const labelCls = "text-xs font-medium text-slate-600";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-[#1e2e5e]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function BookingCheckoutForm({
  offer,
  checkIn,
  checkOut,
  guests,
  rooms,
  roomPackageName,
  roomMealType,
  roomTotalPrice,
  cabin,
  trip,
  liveFlightToken,
  liveFlightTotal,
}: {
  offer: Offer;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  roomPackageName?: string;
  roomMealType?: string;
  roomTotalPrice?: number;
  cabin?: CabinClass;
  trip?: TripType;
  liveFlightToken?: string;
  liveFlightTotal?: number;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const isFlight = offer.type === "FLIGHT";

  const [bookingType, setBookingType] = useState<BookingType>("PRIVATE");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [addressCountry, setAddressCountry] = useState("Germany");
  const [companyName, setCompanyName] = useState("");
  const [companyVatId, setCompanyVatId] = useState("");
  const [estimatedArrival, setEstimatedArrival] = useState(ARRIVAL_SLOTS[0]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof CRYPTO_PAYMENT_METHODS)[number]>("CRYPTO_BTC");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const parts = user.name.trim().split(/\s+/);
    if (!guestFirstName && parts[0]) setGuestFirstName(parts[0]);
    if (!guestLastName && parts.length > 1) setGuestLastName(parts.slice(1).join(" "));
    if (!contactEmail) setContactEmail(user.email);
  }, [user, guestFirstName, guestLastName, contactEmail]);

  const requiredAdditionalCount = Math.max(0, guests - 1);

  useEffect(() => {
    setAdditionalGuests((prev) => {
      if (prev.length >= requiredAdditionalCount) return prev;
      const next = [...prev];
      while (next.length < requiredAdditionalCount) {
        next.push({ firstName: "", lastName: "" });
      }
      return next;
    });
  }, [requiredAdditionalCount]);

  const addAdditionalGuest = () => {
    setAdditionalGuests((prev) => [...prev, { firstName: "", lastName: "" }]);
  };

  const removeAdditionalGuest = (index: number) => {
    if (index < requiredAdditionalCount) return;
    setAdditionalGuests((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!guestFirstName.trim()) errs.guestFirstName = "Required";
    if (!guestLastName.trim()) errs.guestLastName = "Required";
    if (!contactEmail.trim()) errs.contactEmail = "Required";
    if (!contactPhone.trim()) errs.contactPhone = "Required";
    if (!addressLine1.trim()) errs.addressLine1 = "Required";
    if (!addressCity.trim()) errs.addressCity = "Required";
    if (!addressPostalCode.trim()) errs.addressPostalCode = "Required";
    if (!addressCountry.trim()) errs.addressCountry = "Required";
    if (bookingType === "BUSINESS" && !companyName.trim()) errs.companyName = "Required for business bookings";
    additionalGuests.forEach((g, i) => {
      if (!g.firstName.trim()) errs[`guest_${i}_first`] = "Required";
      if (!g.lastName.trim()) errs[`guest_${i}_last`] = "Required";
    });
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setError("Please complete all required fields before continuing to payment.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerId: offer.id,
        checkIn,
        checkOut,
        guests,
        rooms,
        paymentMethod,
        bookingType,
        guestFirstName: guestFirstName.trim(),
        guestLastName: guestLastName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        addressCity: addressCity.trim(),
        addressPostalCode: addressPostalCode.trim(),
        addressCountry: addressCountry.trim(),
        companyName: bookingType === "BUSINESS" ? companyName.trim() : undefined,
        companyVatId: bookingType === "BUSINESS" ? companyVatId.trim() || undefined : undefined,
        estimatedArrival,
        specialRequests: specialRequests.trim() || undefined,
        additionalGuests,
        roomPackageName,
        roomMealType,
        roomTotalPrice,
        cabin,
        trip,
        liveFlightToken,
        liveFlightTotal,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Could not complete booking");
      return;
    }

    router.push(`/offers/${offer.id}/payment?bookingId=${data.booking.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section
        title="Who is this booking for?"
        subtitle="Select whether you are travelling privately or booking on behalf of a company."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { id: "PRIVATE" as const, icon: User, label: "Private", desc: "Leisure / personal travel" },
              { id: "BUSINESS" as const, icon: Building2, label: "Business", desc: "Company invoice & VAT details" },
            ] as const
          ).map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setBookingType(id)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                bookingType === id
                  ? "border-[#1e2e5e] bg-slate-50 ring-2 ring-[#1e2e5e]/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Icon size={20} className={bookingType === id ? "text-[#2577be]" : "text-slate-400"} />
              <div>
                <p className="font-semibold text-[#1e2e5e]">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section
        title={isFlight ? "Lead passenger details" : "Lead guest details"}
        subtitle={isFlight ? "Name must match passport or government ID." : "The main guest checking in — name must match travel ID."}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>First name *</label>
            <input className={inputCls} value={guestFirstName} onChange={(e) => setGuestFirstName(e.target.value)} placeholder="As on passport / ID" />
            {fieldErrors.guestFirstName && <p className="mt-1 text-xs text-red-500">{fieldErrors.guestFirstName}</p>}
          </div>
          <div>
            <label className={labelCls}>Last name *</label>
            <input className={inputCls} value={guestLastName} onChange={(e) => setGuestLastName(e.target.value)} />
            {fieldErrors.guestLastName && <p className="mt-1 text-xs text-red-500">{fieldErrors.guestLastName}</p>}
          </div>
        </div>
      </Section>

      {bookingType === "BUSINESS" && (
        <Section title="Company details" subtitle="Required for business bookings and invoicing.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Company name *</label>
              <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              {fieldErrors.companyName && <p className="mt-1 text-xs text-red-500">{fieldErrors.companyName}</p>}
            </div>
            <div>
              <label className={labelCls}>VAT / Tax ID</label>
              <input className={inputCls} value={companyVatId} onChange={(e) => setCompanyVatId(e.target.value)} placeholder="Optional" />
            </div>
          </div>
        </Section>
      )}

      <Section title="Contact information" subtitle="We'll send your confirmation and updates here.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Email address *</label>
            <input type="email" className={inputCls} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            {fieldErrors.contactEmail && <p className="mt-1 text-xs text-red-500">{fieldErrors.contactEmail}</p>}
          </div>
          <div>
            <label className={labelCls}>Mobile phone *</label>
            <input type="tel" className={inputCls} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+49 170 1234567" />
            {fieldErrors.contactPhone && <p className="mt-1 text-xs text-red-500">{fieldErrors.contactPhone}</p>}
          </div>
        </div>
      </Section>

      <Section title="Billing address" subtitle="Required for invoice and property registration in many countries.">
        <div className="grid gap-4">
          <div>
            <label className={labelCls}>Street address *</label>
            <input className={inputCls} value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
            {fieldErrors.addressLine1 && <p className="mt-1 text-xs text-red-500">{fieldErrors.addressLine1}</p>}
          </div>
          <div>
            <label className={labelCls}>Apartment, suite, etc.</label>
            <input className={inputCls} value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>City *</label>
              <input className={inputCls} value={addressCity} onChange={(e) => setAddressCity(e.target.value)} />
              {fieldErrors.addressCity && <p className="mt-1 text-xs text-red-500">{fieldErrors.addressCity}</p>}
            </div>
            <div>
              <label className={labelCls}>Postal code *</label>
              <input className={inputCls} value={addressPostalCode} onChange={(e) => setAddressPostalCode(e.target.value)} />
              {fieldErrors.addressPostalCode && <p className="mt-1 text-xs text-red-500">{fieldErrors.addressPostalCode}</p>}
            </div>
            <div>
              <label className={labelCls}>Country *</label>
              <select className={inputCls} value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)}>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Additional guests"
        subtitle={
          requiredAdditionalCount > 0
            ? `${requiredAdditionalCount} additional guest${requiredAdditionalCount > 1 ? "s" : ""} required for your ${guests}-guest booking.`
            : "Optional — add names of other travelers in your party."
        }
      >
        {(requiredAdditionalCount > 0 || additionalGuests.length > 0) && (
          <div className="mb-5 flex gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <Info size={18} className="mt-0.5 flex-shrink-0 text-sky-600" />
            <p>
              {requiredAdditionalCount > 0 ? (
                <>
                  Your reservation includes <strong>{guests} guests</strong>. Please enter the full
                  legal name of each additional person — hotels often require this before check-in.
                  Names should match passport or ID.
                </>
              ) : (
                <>
                  Traveling with family or friends? Add their names here so the property can
                  register everyone on arrival.
                </>
              )}
            </p>
          </div>
        )}

        {additionalGuests.length > 0 ? (
          <div className="space-y-4">
            {additionalGuests.map((g, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Guest {i + 2}
                    {i < requiredAdditionalCount && (
                      <span className="ml-1.5 font-normal text-sky-600">· required</span>
                    )}
                  </p>
                  {i >= requiredAdditionalCount && (
                    <button
                      type="button"
                      onClick={() => removeAdditionalGuest(i)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove guest ${i + 2}`}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>First name *</label>
                    <input
                      className={inputCls}
                      value={g.firstName}
                      onChange={(e) => {
                        const next = [...additionalGuests];
                        next[i] = { ...next[i], firstName: e.target.value };
                        setAdditionalGuests(next);
                      }}
                      placeholder="As on passport / ID"
                    />
                    {fieldErrors[`guest_${i}_first`] && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors[`guest_${i}_first`]}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Last name *</label>
                    <input
                      className={inputCls}
                      value={g.lastName}
                      onChange={(e) => {
                        const next = [...additionalGuests];
                        next[i] = { ...next[i], lastName: e.target.value };
                        setAdditionalGuests(next);
                      }}
                    />
                    {fieldErrors[`guest_${i}_last`] && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors[`guest_${i}_last`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No additional guests added yet.</p>
        )}

        <button
          type="button"
          onClick={addAdditionalGuest}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-3 text-sm font-semibold text-[#2577be] transition hover:border-[#2577be] hover:bg-sky-50/50"
        >
          <Plus size={18} />
          Add guest
        </button>
      </Section>

      <Section title="Arrival & special requests">
        <div className="grid gap-4">
          <div>
            <label className={labelCls}>Estimated arrival time</label>
            <select className={inputCls} value={estimatedArrival} onChange={(e) => setEstimatedArrival(e.target.value)}>
              {ARRIVAL_SLOTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Special requests (optional)</label>
            <textarea
              className={`${inputCls} min-h-[100px] resize-y`}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="High floor, late check-in, dietary requirements, crib, etc."
              maxLength={1000}
            />
            <p className="mt-1 text-[10px] text-slate-400">Requests are subject to availability and cannot be guaranteed.</p>
          </div>
        </div>
      </Section>

      <Section title="Payment method" subtitle={GATEWAY_NAME}>
        <CryptoMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
      </Section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3 text-sm text-slate-600">
          <ShieldCheck size={18} className="mt-0.5 flex-shrink-0 text-emerald-600" />
          <p>
            By continuing, you confirm that guest names match valid ID documents and that your contact
            details are correct. The property may require this information before check-in.
          </p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e2e5e] py-4 text-sm font-bold text-white transition hover:bg-[#2577be] disabled:opacity-50"
        >
          {submitting ? "Creating booking…" : "Continue to payment"}
          {!submitting && <ChevronRight size={18} />}
        </button>
      </div>
    </form>
  );
}
