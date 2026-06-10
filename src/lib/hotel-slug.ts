import { prisma } from "@/lib/prisma";
import { fetchLiveHotelsForQuery, upsertLiveHotels } from "@/lib/travala-live-search";

export function parseTravalaSlug(metadata: string | null | undefined): string | null {
  if (!metadata) return null;
  try {
    const data = JSON.parse(metadata) as { travalaSlug?: string; url?: string };
    if (data.travalaSlug) return data.travalaSlug;
    if (data.url) {
      const m = data.url.match(/\/hotel\/([^/?#]+)/);
      if (m) return m[1];
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function findOfferByHotelSlug(slug: string) {
  const offers = await prisma.offer.findMany({
    where: { type: "HOTEL", metadata: { contains: slug } },
    take: 20,
  });
  const found = offers.find((o) => parseTravalaSlug(o.metadata) === slug) ?? offers[0];
  if (found) return found;

  try {
    const res = await fetch(`https://www.travala.com/hotel/${slug}`, {
      headers: { "User-Agent": "Mozilla/5.0 TravalaClone/1.0" },
      cache: "no-store",
    });
    if (res.ok) {
      const live = await fetchLiveHotelsForQuery(slug.replace(/-\d+$/, "").replace(/-/g, " "));
      const match = live.find((h) => String(h.metadata.travalaSlug) === slug);
      if (match) {
        await upsertLiveHotels([match]);
        const created = await prisma.offer.findFirst({
          where: { type: "HOTEL", metadata: { contains: slug } },
        });
        if (created) return created;
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}
