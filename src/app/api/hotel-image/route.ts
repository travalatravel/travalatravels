import { NextResponse } from "next/server";
import { fetchOfferPhotos } from "@/lib/travala-image";

const cache = new Map<string, { photos: string[]; at: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24;

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug || !/^[\w-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const cached = cache.get(slug);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return NextResponse.json({ url: cached.photos[0] });
  }

  try {
    const photos = await fetchOfferPhotos("HOTEL", { slug });
    if (!photos.length) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    cache.set(slug, { photos, at: Date.now() });
    return NextResponse.json(
      { url: photos[0] },
      { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }
}
