import { NextResponse } from "next/server";
import { resolveIataCode } from "@/lib/iata-codes";
import { generateMarketFlights } from "@/lib/flight-market-engine";
import type { CabinClass, TripType } from "@/lib/flight-types";

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

  let flights = generateMarketFlights({
    fromCode,
    toCode,
    fromLabel: from,
    toLabel: to,
    depart,
    returnDate: trip === "roundtrip" ? returnDate : undefined,
    trip,
    cabin,
    adults,
    children,
    infants,
  });

  if (sort === "price-desc") {
    flights.sort((a, b) => b.salePrice - a.salePrice);
  } else {
    flights.sort((a, b) => a.salePrice - b.salePrice);
  }

  return NextResponse.json({
    flights,
    total: flights.length,
    source: "market",
    fromCode,
    toCode,
    discountPct: 30,
  });
}
