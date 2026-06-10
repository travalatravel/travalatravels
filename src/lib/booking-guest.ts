import { z } from "zod";

export const BOOKING_TYPES = ["PRIVATE", "BUSINESS"] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

export type AdditionalGuest = {
  firstName: string;
  lastName: string;
};

export const guestDetailsSchema = z.object({
  bookingType: z.enum(BOOKING_TYPES),
  guestFirstName: z.string().min(1, "First name is required"),
  guestLastName: z.string().min(1, "Last name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(6, "Phone number is required"),
  addressLine1: z.string().min(3, "Street address is required"),
  addressLine2: z.string().optional(),
  addressCity: z.string().min(2, "City is required"),
  addressPostalCode: z.string().min(2, "Postal code is required"),
  addressCountry: z.string().min(2, "Country is required"),
  companyName: z.string().optional(),
  companyVatId: z.string().optional(),
  estimatedArrival: z.string().optional(),
  specialRequests: z.string().max(1000).optional(),
  additionalGuests: z
    .array(
      z.object({
        firstName: z.string().min(1, "First name required"),
        lastName: z.string().min(1, "Last name required"),
      })
    )
    .default([]),
});

export type GuestDetailsInput = z.infer<typeof guestDetailsSchema>;

export function parseAdditionalGuests(json: string | null | undefined): AdditionalGuest[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guestDisplayName(booking: {
  guestFirstName?: string | null;
  guestLastName?: string | null;
}): string {
  const name = [booking.guestFirstName, booking.guestLastName].filter(Boolean).join(" ");
  return name || "Guest";
}

export const COUNTRY_OPTIONS = [
  "Germany",
  "Austria",
  "Switzerland",
  "United Kingdom",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "United States",
  "Canada",
  "United Arab Emirates",
  "Singapore",
  "Australia",
  "Japan",
  "Other",
];

export const ARRIVAL_SLOTS = [
  "I don't know yet",
  "12:00 – 14:00",
  "14:00 – 16:00",
  "16:00 – 18:00",
  "18:00 – 20:00",
  "20:00 – 22:00",
  "After 22:00",
];
