import { NextResponse } from "next/server";
import { suggestSkyScrapperAirports } from "@/lib/sky-scrapper-airports";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10) || 8, 12);
  const locale = searchParams.get("locale") || "en-US";

  if (q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await suggestSkyScrapperAirports(q, limit, locale);
    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 502 });
  }
}
