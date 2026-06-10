import { NextResponse } from "next/server";
import { resolveIataCode } from "@/lib/iata-codes";
import { generateMarketFlights } from "@/lib/flight-market-engine";
import { searchSkyScrapperFlights, skyScrapperConfigured } from "@/lib/sky-scrapper-flights";
import type { CabinClass, TripType } from "@/lib/flight-types";
import type { LiveFlightOffer } from "@/lib/live-flight-types";

function defaultDepart() {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const fromCodeHint = searchParams.get("fromCode") || "";
  const toCodeHint = searchParams.get("toCode") || "";
  const fromSkyId = searchParams.get("fromSkyId") || "";
  const fromEntityId = searchParams.get("fromEntityId") || "";
  const toSkyId = searchParams.get("toSkyId") || "";
  const toEntityId = searchParams.get("toEntityId") || "";
  const depart = searchParams.get("depart") || defaultDepart();
  const returnDate = searchParams.get("return") || "";
  const trip = (searchParams.get("trip") || "roundtrip") as TripType;
  const cabin = (searchParams.get("cabin") || "economy") as CabinClass;
  const adults = Math.max(1, parseInt(searchParams.get("adults") || "1", 10));
  const children = Math.max(0, parseInt(searchParams.get("children") || "0", 10));
  const infants = Math.max(0, parseInt(searchParams.get("infants") || "0", 10));
  const sort = searchParams.get("sort") || "price-asc";

  const fromCode = resolveIataCode(from, fromCodeHint);
  const toCode = resolveIataCode(to, toCodeHint);

  if (!fromCode || !toCode) {
    return NextResponse.json(
      {
        error: "Could not resolve airport codes. Pick a city or airport from the suggestions.",
        flights: [],
        total: 0,
        source: "none",
      },
      { status: 400 },
    );
  }

  const searchInput = {
    fromCode,
    toCode,
    fromLabel: from,
    toLabel: to,
    fromSky:
      fromSkyId && fromEntityId ? { skyId: fromSkyId, entityId: fromEntityId } : undefined,
    toSky: toSkyId && toEntityId ? { skyId: toSkyId, entityId: toEntityId } : undefined,
    depart,
    returnDate: trip === "roundtrip" ? returnDate : undefined,
    trip,
    cabin,
    adults,
    children,
    infants,
  };

  let flights: LiveFlightOffer[] = [];
  let source: "sky-scrapper" | "market" = "market";

  if (skyScrapperConfigured()) {
    const live = await searchSkyScrapperFlights(searchInput);
    if (live?.length) {
      flights = live;
      source = "sky-scrapper";
    }
  }

  if (!flights.length) {
    flights = generateMarketFlights(searchInput);
    source = "market";
  }

  if (sort === "price-desc") {
    flights.sort((a, b) => b.salePrice - a.salePrice);
  } else {
    flights.sort((a, b) => a.salePrice - b.salePrice);
  }

  return NextResponse.json({
    flights,
    total: flights.length,
    source,
    liveConfigured: skyScrapperConfigured(),
    fromCode,
    toCode,
    discountPct: 30,
  });
}
