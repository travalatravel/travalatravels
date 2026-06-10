import { NextResponse } from "next/server";
import { searchHotelOffers } from "@/lib/hotel-search";
import { matchesFlightRoute, parseFlightMetadata } from "@/lib/flight-display";
import { prisma } from "@/lib/prisma";

const TYPE_MAP: Record<string, string> = {
  stays: "HOTEL",
  hotel: "HOTEL",
  hotels: "HOTEL",
  flights: "FLIGHT",
  flight: "FLIGHT",
  "car-rental": "CAR_RENTAL",
  car: "CAR_RENTAL",
  activities: "ACTIVITY",
  activity: "ACTIVITY",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "stays";
  const city = searchParams.get("city") || "";
  const country = searchParams.get("country") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const sort = searchParams.get("sort") || "recommended";
  const starsMin = parseInt(searchParams.get("starsMin") || "0", 10) || 0;
  const priceMax = parseFloat(searchParams.get("priceMax") || "0") || 0;

  const type = TYPE_MAP[typeParam.toLowerCase()] || "HOTEL";

  if (type === "HOTEL") {
    const result = await searchHotelOffers({
      q: q || undefined,
      country: country || undefined,
      city: city || undefined,
      sort,
      page,
      limit,
      starsMin: starsMin > 0 ? starsMin : undefined,
      priceMax: priceMax > 0 ? priceMax : undefined,
    });

    return NextResponse.json({
      offers: result.offers,
      total: result.total,
      page: result.page,
      pages: result.pages,
      type,
      source: result.source,
    });
  }

  const skip = (page - 1) * limit;
  const orderBy =
    sort === "price-asc"
      ? [{ price: "asc" as const }]
      : sort === "price-desc"
        ? [{ price: "desc" as const }]
        : [{ stars: "desc" as const }, { price: "asc" as const }];

  if (type === "FLIGHT" && (from || to)) {
    const allFlights = await prisma.offer.findMany({ where: { type: "FLIGHT" }, orderBy });
    const filtered = allFlights.filter((o) =>
      matchesFlightRoute(parseFlightMetadata(o.metadata), o.title, from, to),
    );
    return NextResponse.json({
      offers: filtered.slice(skip, skip + limit),
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit),
      type,
    });
  }

  const offers = await prisma.offer.findMany({
    where: { type },
    take: limit,
    skip,
    orderBy,
  });
  const total = await prisma.offer.count({ where: { type } });

  return NextResponse.json({
    offers,
    total,
    page,
    pages: Math.ceil(total / limit),
    type,
  });
}
