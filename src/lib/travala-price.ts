import {
  nightsBetween,
  roomParams,
  travalaGet,
  travalaPackages,
  travalaSessionId,
  usdPerNight,
} from "@/lib/travala-api";
import {
  getCachedLivePrice,
  getInflightLivePrice,
  livePriceCacheKey,
  setCachedLivePrice,
  setInflightLivePrice,
} from "@/lib/live-price-cache";

const API_TIMEOUT_MS = 2800;

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

async function fetchLiveHotelPriceUncached(input: {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}): Promise<LivePriceResult | null> {
  const { slug, checkIn, checkOut, guests, rooms } = input;
  const nights = nightsBetween(checkIn, checkOut);

  const sessionRes = await travalaGet(
    "searching/search/search-property",
    { slug, check_in: checkIn, check_out: checkOut, ...roomParams(guests, rooms) },
    { timeoutMs: API_TIMEOUT_MS },
  );
  const sessionId = typeof sessionRes?.data === "string" ? sessionRes.data : null;
  if (!sessionId) return null;

  const pkgRes = await travalaGet(
    "searching/package/get_package",
    {
      slug,
      session_id: sessionId,
      user_currency_showing: "USD",
      limit_image_rth: "V1",
      merge_room: true,
      entravel_multiple_offers_enabled: false,
      entravel_b2c_enable: false,
      origin: false,
    },
    { timeoutMs: API_TIMEOUT_MS },
  );
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

export async function fetchLiveHotelPrice(input: {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  rooms?: number;
}): Promise<LivePriceResult | null> {
  const guests = input.guests ?? 2;
  const rooms = input.rooms ?? 1;
  const key = livePriceCacheKey({ ...input, guests, rooms });

  const cached = getCachedLivePrice(key);
  if (cached) return cached;

  const inflight = getInflightLivePrice(key);
  if (inflight) return inflight;

  const promise = fetchLiveHotelPriceUncached({ ...input, guests, rooms }).then((result) => {
    if (result?.available && result.source === "travala") setCachedLivePrice(key, result);
    return result;
  });
  setInflightLivePrice(key, promise);
  return promise;
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
