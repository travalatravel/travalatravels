import { NextResponse } from "next/server";
import { resolveIataCode } from "@/lib/iata-codes";
import { generateMarketFlights } from "@/lib/flight-market-engine";
import { decodeFlightToken } from "@/lib/flight-token";
import type { CabinClass, TripType } from "@/lib/flight-types";

function defaultDepart() {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing offer id" }, { status: 400 });
  }

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

  const fromCode = resolveIataCode(from, fromCodeHint);
  const toCode = resolveIataCode(to, toCodeHint);

  if (!fromCode || !toCode) {
    return NextResponse.json({ error: "Invalid route" }, { status: 400 });
  }

  const flights = generateMarketFlights({
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

  const offer = flights.find((f) => f.id === id);
  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  const payload = decodeFlightToken(offer.offerToken);
  if (!payload) {
    return NextResponse.json({ error: "Invalid offer token" }, { status: 500 });
  }

  return NextResponse.json({ offer: payload, token: offer.offerToken });
}
