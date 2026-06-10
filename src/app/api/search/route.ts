import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supplementHotelSearch } from "@/lib/travala-live-search";

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
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const skip = (page - 1) * limit;

  const type = TYPE_MAP[typeParam.toLowerCase()] || "HOTEL";

  const where: {
    type: string;
    OR?: Array<{ title?: { contains: string }; city?: { contains: string }; country?: { contains: string }; location?: { contains: string } }>;
    city?: { contains: string };
    country?: { contains: string };
  } = { type };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { city: { contains: q } },
      { country: { contains: q } },
      { location: { contains: q } },
    ];
  }

  if (city) where.city = { contains: city };
  if (country) where.country = { contains: country };

  let total = await prisma.offer.count({ where });

  if (type === "HOTEL" && q.trim() && total < 30) {
    await supplementHotelSearch(q, total);
    total = await prisma.offer.count({ where });
  }

  const offers = await prisma.offer.findMany({
    where,
    take: limit,
    skip,
    orderBy: [{ stars: "desc" }, { price: "asc" }],
  });

  return NextResponse.json({
    offers,
    total,
    page,
    pages: Math.ceil(total / limit),
    type,
  });
}
