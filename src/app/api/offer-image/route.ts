import { NextResponse } from "next/server";
import { fetchOfferPhotos } from "@/lib/travala-image";
import type { OfferType } from "@/lib/types";

const cache = new Map<string, { photos: string[]; at: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24;

const VALID_TYPES = new Set<OfferType>(["HOTEL", "FLIGHT", "CAR_RENTAL", "ACTIVITY"]);

function cacheKey(
  type: string,
  slug: string | null,
  url: string | null,
  city: string | null,
  country: string | null,
  checkIn: string | null,
  checkOut: string | null,
) {
  return [type, slug || "", url || "", city || "", country || "", checkIn || "", checkOut || ""].join("|");
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const type = (params.get("type") || "HOTEL") as OfferType;
  const slug = params.get("slug");
  const url = params.get("url");
  const city = params.get("city");
  const country = params.get("country");
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");
  const guests = Math.max(1, parseInt(params.get("guests") || "2", 10));
  const rooms = Math.max(1, parseInt(params.get("rooms") || "1", 10));

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid offer type" }, { status: 400 });
  }

  if (type === "HOTEL" && (!slug || !/^[\w-]+$/.test(slug))) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  if (type === "FLIGHT" && (!url || !url.includes("travala.com/flights/"))) {
    return NextResponse.json({ error: "Invalid flight url" }, { status: 400 });
  }

  if ((type === "CAR_RENTAL" || type === "ACTIVITY") && !city?.trim()) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  const key = cacheKey(type, slug, url, city, country, checkIn, checkOut);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return NextResponse.json(
      { url: cached.photos[0] },
      { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
    );
  }

  try {
    const photos = await fetchOfferPhotos(type, {
      slug,
      url,
      city,
      country,
      checkIn,
      checkOut,
      guests,
      rooms,
    });
    if (!photos.length) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    cache.set(key, { photos, at: Date.now() });
    return NextResponse.json(
      { url: photos[0] },
      { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }
}
