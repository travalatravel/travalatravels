import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fetchLiveHotelPrice } from "@/lib/travala-price";
import { travalaSlugFromOffer } from "@/lib/travala-image";

const schema = z.object({
  offerIds: z.array(z.string()).min(1).max(18),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(20).default(2),
  rooms: z.number().int().min(1).max(8).default(1),
  stream: z.boolean().optional(),
});

const CONCURRENCY = 16;

async function mapPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const offers = await prisma.offer.findMany({
      where: { id: { in: data.offerIds }, type: "HOTEL" },
      select: { id: true, metadata: true },
    });
    const byId = new Map(offers.map((o) => [o.id, o]));

    const jobs = data.offerIds
      .map((id) => {
        const offer = byId.get(id);
        const slug = offer ? travalaSlugFromOffer(offer.metadata) : null;
        return slug ? { id, slug } : null;
      })
      .filter(Boolean) as { id: string; slug: string }[];

    const fetchOne = async (job: { id: string; slug: string }) => {
      const live = await fetchLiveHotelPrice({
        slug: job.slug,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.guests,
        rooms: data.rooms,
      });
      return live?.available && live.source === "travala" ? { id: job.id, price: live } : null;
    };

    if (data.stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          await mapPool(jobs, CONCURRENCY, async (job) => {
            try {
              const result = await fetchOne(job);
              if (result) {
                controller.enqueue(encoder.encode(`${JSON.stringify(result)}\n`));
              }
            } catch {
              /* skip failed hotel */
            }
          });
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "application/x-ndjson",
          "Cache-Control": "no-cache",
        },
      });
    }

    const prices: Record<string, Awaited<ReturnType<typeof fetchLiveHotelPrice>>> = {};
    await mapPool(jobs, CONCURRENCY, async (job) => {
      const result = await fetchOne(job);
      if (result) prices[result.id] = result.price;
    });

    return NextResponse.json({ prices });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not fetch live prices" }, { status: 500 });
  }
}
