import { NextResponse } from "next/server";
import { fetchTravalaSuggestions } from "@/lib/travala-suggest";

const VALID_TYPES = new Set(["stays", "flights"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "stays";
  const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10) || 12, 20);

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (q.trim().length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await fetchTravalaSuggestions(q, type, limit);
    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 502 });
  }
}
