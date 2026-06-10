import { NextResponse } from "next/server";
import { resolveIataCode } from "@/lib/iata-codes";
import { KNOWN_AIRPORTS } from "@/lib/sky-scrapper-airports";
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
  const leg = searchParams.get("leg") || "";
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

  const fromSky =
    fromSkyId && fromEntityId ? { skyId: fromSkyId, entityId: fromEntityId } : undefined;
  const toSky = toSkyId && toEntityId ? { skyId: toSkyId, entityId: toEntityId } : undefined;

  let searchInput = {
    fromCode,
    toCode,
    fromLabel: from,
    toLabel: to,
    fromSky,
    toSky,
    depart,
    returnDate: trip === "roundtrip" ? returnDate : undefined,
    trip,
    cabin,
    adults,
    children,
    infants,
  };

  if (leg === "outbound") {
    searchInput = {
      ...searchInput,
      trip: "oneway",
      returnDate: undefined,
    };
  } else if (leg === "return" && returnDate) {
    searchInput = {
      ...searchInput,
      fromCode: toCode,
      toCode: fromCode,
      fromLabel: to,
      toLabel: from,
      fromSky: toSky,
      toSky: fromSky,
      depart: returnDate,
      trip: "oneway",
      returnDate: undefined,
    };
  }

  let flights: LiveFlightOffer[] = [];
  let source: "sky-scrapper" | "none" = "none";

  if (skyScrapperConfigured()) {
    const live = await searchSkyScrapperFlights(searchInput);
    if (live?.length) {
      flights = live;
      source = "sky-scrapper";
    }
  }

  if (!flights.length) {
    return NextResponse.json({
      error: skyScrapperConfigured()
        ? "No live flights found for this route. Try different airports or dates."
        : "Live flight search is not configured.",
      flights: [],
      total: 0,
      source: "none",
      liveConfigured: skyScrapperConfigured(),
      fromCode,
      toCode,
      leg: leg || null,
      discountPct: 30,
    });
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
    leg: leg || null,
    discountPct: 30,
  });
}
