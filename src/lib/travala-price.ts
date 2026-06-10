import {
  nightsBetween,
  roomParams,
  travalaGet,
  travalaPackages,
  travalaSessionId,
  usdPerNight,
} from "@/lib/travala-api";

export type LivePriceResult = {
  source: "travala" | "estimated";
  currency: "USD";
  pricePerNight: number;
  totalPrice: number;
  nights: number;
  rooms: number;
  guests: number;
  available: boolean;
  mealType?: string;
  refundable?: boolean;
};

export async function fetchLiveHotelPrice(input: {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  rooms?: number;
}): Promise<LivePriceResult | null> {
  const guests = input.guests ?? 2;
  const rooms = input.rooms ?? 1;
  const nights = nightsBetween(input.checkIn, input.checkOut);

  const sessionId = await travalaSessionId(input.slug, input.checkIn, input.checkOut, guests, rooms);
  if (!sessionId) return null;

  const pkgRes = await travalaPackages(input.slug, sessionId);
  if (!pkgRes?.success) return null;

  const lowest = pkgRes.meta?.lowest_package_price as Record<string, unknown> | undefined;
  let pricePerNight = usdPerNight(lowest);

  if (!pricePerNight && Array.isArray(pkgRes.data) && pkgRes.data.length > 0) {
    const firstPackage = pkgRes.data[0] as { results?: Record<string, unknown>[] };
    const firstResult = firstPackage.results?.[0];
    pricePerNight = usdPerNight(firstResult);
  }

  if (!pricePerNight || pricePerNight <= 0) return null;

  return {
    source: "travala",
    currency: "USD",
    pricePerNight: Math.round(pricePerNight * 100) / 100,
    totalPrice: Math.round(pricePerNight * nights * rooms * 100) / 100,
    nights,
    rooms,
    guests,
    available: true,
    mealType: typeof lowest?.foodTypeLocalized === "string" ? lowest.foodTypeLocalized : undefined,
    refundable: lowest?.refundability === "refundable",
  };
}

export function defaultStayDates(): { checkIn: string; checkOut: string } {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 30);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 3);
  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}
