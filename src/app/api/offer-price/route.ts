import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchLiveHotelPrice, defaultStayDates, type LivePriceResult } from "@/lib/travala-price";
import { travalaSlugFromOffer } from "@/lib/travala-image";

const cache = new Map<string, { data: LivePriceResult; at: number }>();
const CACHE_TTL = 1000 * 60 * 5;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offerId = searchParams.get("offerId");
  const slugParam = searchParams.get("slug");
  let checkIn = searchParams.get("checkIn") || "";
  let checkOut = searchParams.get("checkOut") || "";
  const guests = Math.min(Math.max(parseInt(searchParams.get("guests") || "2", 10), 1), 20);
  const rooms = Math.min(Math.max(parseInt(searchParams.get("rooms") || "1", 10), 1), 4);

  if (!checkIn || !checkOut) {
    const defaults = defaultStayDates();
    checkIn = defaults.checkIn;
    checkOut = defaults.checkOut;
  }

  let slug = slugParam;
  let estimatedPrice = 0;
  let offerType = "HOTEL";

  if (offerId) {
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }
    estimatedPrice = offer.price;
    offerType = offer.type;
    slug = slug || travalaSlugFromOffer(offer.metadata);
  }

  if (offerType !== "HOTEL" || !slug) {
    const nights = Math.max(
      1,
      Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    );
    const total =
      offerType === "CAR_RENTAL"
        ? estimatedPrice * nights
        : offerType === "FLIGHT" || offerType === "ACTIVITY"
          ? estimatedPrice * guests
          : estimatedPrice * nights * rooms;

    return NextResponse.json({
      source: "estimated",
      currency: "USD",
      pricePerNight: estimatedPrice,
      totalPrice: Math.round(total * 100) / 100,
      nights,
      rooms,
      guests,
      available: true,
      note: "Live pricing is only available for hotels via travala.com",
    } satisfies LivePriceResult & { note?: string });
  }

  const cacheKey = `${slug}:${checkIn}:${checkOut}:${guests}:${rooms}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  try {
    const live = await fetchLiveHotelPrice({ slug, checkIn, checkOut, guests, rooms });
    if (live) {
      cache.set(cacheKey, { data: live, at: Date.now() });
      return NextResponse.json(live, { headers: { "Cache-Control": "public, max-age=300" } });
    }
  } catch {
    /* fall through to estimated */
  }

  const nights = Math.max(
    1,
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
  );

  return NextResponse.json({
    source: "estimated",
    currency: "USD",
    pricePerNight: estimatedPrice,
    totalPrice: Math.round(estimatedPrice * nights * rooms * 100) / 100,
    nights,
    rooms,
    guests,
    available: false,
    note: "Could not fetch live price from travala.com",
  } satisfies LivePriceResult & { note?: string });
}
