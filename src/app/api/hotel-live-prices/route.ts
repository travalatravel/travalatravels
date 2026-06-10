import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fetchLiveHotelPrice, type LivePriceResult } from "@/lib/travala-price";
import { travalaSlugFromOffer } from "@/lib/travala-image";

const schema = z.object({
  offerIds: z.array(z.string()).min(1).max(24),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(20).default(2),
  rooms: z.number().int().min(1).max(8).default(1),
});

const FETCH_TIMEOUT_MS = 5000;
const CONCURRENCY = 4;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
  } catch {
    return null;
  }
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const offers = await prisma.offer.findMany({
      where: { id: { in: data.offerIds }, type: "HOTEL" },
      select: { id: true, price: true, metadata: true },
    });

    const byId = new Map(offers.map((o) => [o.id, o]));
    const prices: Record<string, LivePriceResult> = {};

    await mapPool(data.offerIds, CONCURRENCY, async (id) => {
      const offer = byId.get(id);
      if (!offer) return;

      const slug = travalaSlugFromOffer(offer.metadata);
      if (!slug) return;

      const live = await withTimeout(
        fetchLiveHotelPrice({
          slug,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          rooms: data.rooms,
        }),
        FETCH_TIMEOUT_MS,
      );

      if (live?.available && live.source === "travala") {
        prices[id] = live;
      }
    });

    return NextResponse.json({ prices });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not fetch live prices" }, { status: 500 });
  }
}
