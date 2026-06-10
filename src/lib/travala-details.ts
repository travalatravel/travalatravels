import { fetchTravalaHotelPage } from "@/lib/travala-image";
import {
  nightsBetween,
  travalaPackages,
  travalaSessionId,
  usdPerNight,
  usdTotal,
} from "@/lib/travala-api";

export type OfferDetailSection = { title: string; content: string; html?: boolean };

export type OfferRoomOption = {
  id: string;
  packageName: string;
  pricePerNight: number;
  totalPrice: number;
  mealType?: string;
  refundable: boolean;
  bedDescription?: string;
  amenities: string[];
};

export function generateFallbackRooms(
  basePricePerNight: number,
  nights: number,
  roomCount: number
): OfferRoomOption[] {
  const templates = [
    {
      packageName: "Standard Room",
      bedDescription: "1 queen bed · city view",
      mealType: "Room only",
      refundable: false,
      multiplier: 1,
      amenities: ["Free WiFi", "Air conditioning", "Private bathroom"],
    },
    {
      packageName: "Superior Room",
      bedDescription: "1 king bed · partial view",
      mealType: "Breakfast included",
      refundable: true,
      multiplier: 1.15,
      amenities: ["Free WiFi", "Breakfast", "Room service"],
    },
    {
      packageName: "Deluxe Suite",
      bedDescription: "King bed · separate living area",
      mealType: "Breakfast included",
      refundable: true,
      multiplier: 1.35,
      amenities: ["Free WiFi", "Breakfast", "Lounge access", "Mini bar"],
    },
  ];

  return templates.map((template, index) => {
    const pricePerNight = Math.round(basePricePerNight * template.multiplier * 100) / 100;
    return {
      id: `room-${index}-${template.packageName.toLowerCase().replace(/\s+/g, "-")}`,
      packageName: template.packageName,
      pricePerNight,
      totalPrice: Math.round(pricePerNight * nights * roomCount * 100) / 100,
      mealType: template.mealType,
      refundable: template.refundable,
      bedDescription: template.bedDescription,
      amenities: template.amenities,
    };
  });
}

export type OfferDetailsData = {
  source: "travala" | "local";
  description: string;
  address?: string;
  phone?: string;
  checkIn?: { from?: string; to?: string };
  checkOut?: { until?: string };
  amenities: string[];
  policies: string[];
  sections: OfferDetailSection[];
  rooms: OfferRoomOption[];
};

type FacilityItem = { name?: string; icon?: string; popular?: boolean };

function descriptionText(desc: Record<string, string> | undefined): string {
  if (!desc) return "";
  const values = Object.values(desc).filter(Boolean);
  return values[0] || "";
}

function parseHotelProps(hotel: Record<string, unknown>): Omit<OfferDetailsData, "rooms" | "source"> {
  const desc = hotel.description as Record<string, string> | undefined;
  const times = hotel.checkin_checkout_times as {
    checkin_from?: string;
    checkin_to?: string;
    checkout_to?: string;
  } | undefined;

  const popular = (hotel.popular_amenities as FacilityItem[] | undefined) || [];
  const facilities = (hotel.facilities as FacilityItem[] | undefined) || [];
  const uniqueAmenities = [
    ...new Set(
      [...popular, ...facilities].map((a) => a.name).filter(Boolean) as string[]
    ),
  ];

  const policies = ((hotel.hotel_policies as { name?: string }[]) || [])
    .map((p) => p.name)
    .filter(Boolean) as string[];

  const sections: OfferDetailSection[] = [];

  for (const block of (hotel.hotel_important_information as { name?: string; content?: string }[]) || []) {
    if (!block.name || !block.content) continue;
    sections.push({
      title: block.name,
      content: block.content,
      html: block.content.includes("<"),
    });
  }

  const attractions = hotel.attractions as string | undefined;
  if (attractions?.trim()) {
    sections.push({ title: "Nearby attractions", content: attractions });
  }

  const address = [
    hotel.street_address,
    hotel.city_name,
    hotel.country_name,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    description: descriptionText(desc),
    address: address || undefined,
    phone: typeof hotel.phone === "string" ? hotel.phone : undefined,
    checkIn: times
      ? { from: times.checkin_from, to: times.checkin_to }
      : undefined,
    checkOut: times?.checkout_to ? { until: times.checkout_to } : undefined,
    amenities: uniqueAmenities,
    policies,
    sections,
  };
}

function parsePackages(
  pkgData: unknown,
  nights: number
): OfferRoomOption[] {
  if (!Array.isArray(pkgData)) return [];

  const rooms: OfferRoomOption[] = [];

  for (const pkg of pkgData) {
    const packageName = String((pkg as { packageName?: string }).packageName || "Room");
    const results = (pkg as { results?: Record<string, unknown>[] }).results || [];

    for (const result of results) {
      const pricePerNight = usdPerNight(result);
      if (!pricePerNight) continue;

      const total = usdTotal(result) ?? pricePerNight * nights;
      const bedGroups = (result.bed_groups as { en_description?: string; description?: string }[]) || [];
      const bedDescription = bedGroups.map((b) => b.en_description || b.description).filter(Boolean).join(", ");
      const amenities = ((result.amenities as { en_name?: string; name?: string }[]) || [])
        .map((a) => a.en_name || a.name)
        .filter(Boolean) as string[];

      const roundedNight = Math.round(pricePerNight * 100) / 100;
      rooms.push({
        id: `${packageName}-${bedDescription || "std"}-${roundedNight}-${rooms.length}`,
        packageName,
        pricePerNight: roundedNight,
        totalPrice: Math.round(total * 100) / 100,
        mealType: typeof result.foodTypeLocalized === "string" ? result.foodTypeLocalized : undefined,
        refundable: result.refundability === "refundable",
        bedDescription: bedDescription || undefined,
        amenities,
      });
    }
  }

  return rooms
    .sort((a, b) => a.pricePerNight - b.pricePerNight)
    .slice(0, 12);
}

export async function fetchHotelDetails(input: {
  slug: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
}): Promise<OfferDetailsData | null> {
  const props = await fetchTravalaHotelPage(input.slug);
  const hotel = props?.hotelInformationProps as Record<string, unknown> | undefined;
  if (!hotel) return null;

  const base = parseHotelProps(hotel);
  let roomOptions: OfferRoomOption[] = [];

  if (input.checkIn && input.checkOut) {
    const guests = input.guests ?? 2;
    const rooms = input.rooms ?? 1;
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const sessionId = await travalaSessionId(
      input.slug,
      input.checkIn,
      input.checkOut,
      guests,
      rooms
    );
    if (sessionId) {
      const pkgRes = await travalaPackages(input.slug, sessionId);
      if (pkgRes?.success) {
        roomOptions = parsePackages(pkgRes.data, nights);
      }
    }
  }

  return { source: "travala", ...base, rooms: roomOptions };
}

export function localOfferDetails(offer: {
  type: string;
  description: string;
  location: string;
  metadata: string | null;
}): OfferDetailsData {
  let meta: Record<string, unknown> = {};
  try {
    meta = offer.metadata ? JSON.parse(offer.metadata) : {};
  } catch {
    meta = {};
  }

  const sections: OfferDetailSection[] = [];
  const amenities = Array.isArray(meta.amenities) ? (meta.amenities as string[]) : [];

  if (offer.type === "FLIGHT" && meta.duration) {
    sections.push({
      title: "Flight details",
      content: `Airline: ${meta.airline || "—"}\nRoute: ${meta.from || "—"} → ${meta.to || "—"}\nDuration: ${meta.duration}\nClass: ${meta.class || "Economy"}`,
    });
  }

  if (offer.type === "CAR_RENTAL") {
    sections.push({
      title: "Rental details",
      content: `Pick-up location: ${offer.location}\nTransmission: ${meta.transmission || "Automatic"}\nFuel policy: ${meta.fuel || "Full to Full"}`,
    });
  }

  if (offer.type === "ACTIVITY") {
    sections.push({
      title: "Activity details",
      content: `Location: ${offer.location}${meta.duration ? `\nDuration: ${meta.duration}` : ""}${meta.instantConfirmation ? "\nInstant confirmation" : ""}`,
    });
  }

  return {
    source: "local",
    description: offer.description,
    address: offer.location,
    amenities,
    policies: [],
    sections,
    rooms: [],
  };
}
