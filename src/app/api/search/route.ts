import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supplementHotelSearch } from "@/lib/travala-live-search";
import { normalizeSearchQuery, searchTermsForQuery } from "@/lib/search-query";
import { matchesFlightRoute, parseFlightMetadata } from "@/lib/flight-display";

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
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const skip = (page - 1) * limit;
  const sort = searchParams.get("sort") || "recommended";

  const type = TYPE_MAP[typeParam.toLowerCase()] || "HOTEL";

  const orderBy =
    sort === "price-asc"
      ? [{ price: "asc" as const }]
      : sort === "price-desc"
        ? [{ price: "desc" as const }]
        : sort === "stars-desc"
          ? [{ stars: "desc" as const }, { price: "asc" as const }]
          : [{ stars: "desc" as const }, { price: "asc" as const }];

  const where: {
    type: string;
    OR?: Array<{ title?: { contains: string }; city?: { contains: string }; country?: { contains: string }; location?: { contains: string } }>;
    city?: { contains: string };
    country?: { contains: string };
  } = { type };

  if (q) {
    const terms = searchTermsForQuery(q);
    where.OR = terms.flatMap((term) => [
      { title: { contains: term } },
      { city: { contains: term } },
      { country: { contains: term } },
      { location: { contains: term } },
    ]);
  }

  if (city) where.city = { contains: city };
  if (country) where.country = { contains: country };

  let total = await prisma.offer.count({ where });

  if (type === "HOTEL" && q.trim() && total < 30) {
    await supplementHotelSearch(normalizeSearchQuery(q) || q.trim(), total);
    total = await prisma.offer.count({ where });
  }

  let offers;

  if (type === "FLIGHT" && (from || to)) {
    const allFlights = await prisma.offer.findMany({ where: { type: "FLIGHT" }, orderBy });
    const filtered = allFlights.filter((o) =>
      matchesFlightRoute(parseFlightMetadata(o.metadata), o.title, from, to),
    );
    total = filtered.length;
    offers = filtered.slice(skip, skip + limit);
  } else {
    offers = await prisma.offer.findMany({ where, take: limit, skip, orderBy });
  }

  return NextResponse.json({
    offers,
    total,
    page,
    pages: Math.ceil(total / limit),
    type,
  });
}
