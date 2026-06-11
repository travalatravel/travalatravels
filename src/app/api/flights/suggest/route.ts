import { NextResponse } from "next/server";
import { filterPopularAirports } from "@/data/popular-airports";
import { rapidApiConfigured } from "@/lib/rapidapi-fetch";
import { suggestSkyScrapperAirports } from "@/lib/sky-scrapper-airports";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10) || 8, 12);
  const locale = searchParams.get("locale") || "en-US";

  const popular = filterPopularAirports(q, limit);
  const cacheHeaders = { "Cache-Control": "public, max-age=86400" };

  if (q.trim().length < 2 || !rapidApiConfigured()) {
    return NextResponse.json({ suggestions: popular }, { headers: cacheHeaders });
  }

  try {
    const live = await suggestSkyScrapperAirports(q, limit, locale);
    if (!live.length) {
      return NextResponse.json({ suggestions: popular }, { headers: cacheHeaders });
    }

    const seen = new Set(live.map((s) => `${s.skyId}:${s.entityId}`));
    const merged = [
      ...live,
      ...popular.filter((p) => p.skyId && p.entityId && !seen.has(`${p.skyId}:${p.entityId}`)),
    ].slice(0, limit);

    return NextResponse.json(
      { suggestions: merged },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json({ suggestions: popular }, { headers: cacheHeaders });
  }
}
