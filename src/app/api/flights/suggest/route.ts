import { NextResponse } from "next/server";
import { suggestSkyScrapperAirports, skyScrapperAirportConfigured } from "@/lib/sky-scrapper-airports";
import { fetchTravalaSuggestions } from "@/lib/travala-suggest";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10) || 8, 12);
  const locale = searchParams.get("locale") || "en-US";

  if (q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    let suggestions;
    if (skyScrapperAirportConfigured()) {
      suggestions = await suggestSkyScrapperAirports(q, limit, locale);
      if (!suggestions.length) {
        suggestions = await fetchTravalaSuggestions(q, "flights", limit);
      }
    } else {
      suggestions = await fetchTravalaSuggestions(q, "flights", limit);
    }

    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 502 });
  }
}
