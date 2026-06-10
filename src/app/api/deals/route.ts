import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOfferPricing } from "@/lib/pricing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 24);

  const offers = await prisma.offer.findMany({
    where: {
      type: "HOTEL",
      stars: { gte: 4 },
    },
    orderBy: [{ stars: "desc" }, { price: "asc" }],
    take: limit * 2,
  });

  const withSavings = offers
    .map((offer) => ({
      offer,
      pricing: getOfferPricing(offer.price, offer.id, offer.stars),
    }))
    .sort((a, b) => b.pricing.savings - a.pricing.savings)
    .slice(0, limit)
    .map(({ offer, pricing }) => ({ ...offer, pricing }));

  return NextResponse.json({ deals: withSavings });
}
