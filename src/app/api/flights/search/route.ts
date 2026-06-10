import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveIataCode } from "@/lib/iata-codes";
import { getFlightPricing } from "@/lib/flight-pricing";
import { generateMarketFlights } from "@/lib/flight-market-engine";
import { searchSkyScrapperFlights, skyScrapperConfigured } from "@/lib/sky-scrapper-flights";
import { matchesFlightRoute, parseFlightMetadata, flightTimesForOffer, stopsForOffer } from "@/lib/flight-display";
import { encodeFlightToken } from "@/lib/flight-token";
import type { LiveFlightOffer } from "@/lib/live-flight-types";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { airlineName } from "@/lib/airline-names";

function defaultDepart() {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

function catalogToLive(
  row: {
    id: string;
    title: string;
    price: number;
    metadata: string | null;
  },
  input: {
    trip: TripType;
    cabin: CabinClass;
    adults: number;
    children: number;
    infants: number;
    from: string;
    to: string;
    depart: string;
  },
): LiveFlightOffer {
  const meta = parseFlightMetadata(row.metadata);
  const times = flightTimesForOffer(row.id, meta.duration || "3h 0m");
  const stops = meta.stops ?? stopsForOffer(row.id);
  const pax = input.adults + input.children + input.infants;
  const roundMult = input.trip === "roundtrip" ? 1.85 : 1;
  const sourcePrice = Math.round(row.price * pax * roundMult * 100) / 100;
  const pricing = getFlightPricing(sourcePrice);

  const departAt = `${input.depart}T${times.depart}:00`;
  const arriveAt = `${input.depart}T${times.arrive}:00`;

  const offer: LiveFlightOffer = {
    id: row.id,
    airline: meta.airline || airlineName("XX"),
    airlineCode: "XX",
    from: meta.from || input.from,
    to: meta.to || input.to,
    fromCode: meta.fromCode || "",
    toCode: meta.toCode || "",
    departAt,
    arriveAt,
    duration: meta.duration || "3h 0m",
    stops,
    sourcePrice: pricing.originalPrice,
    salePrice: pricing.salePrice,
    currency: "USD",
    cabin: input.cabin,
    trip: input.trip,
    segments: [
      {
        airline: meta.airline || "Airline",
        airlineCode: "XX",
        from: meta.from || input.from,
        fromCode: meta.fromCode || "",
        to: meta.to || input.to,
        toCode: meta.toCode || "",
        departAt,
        arriveAt,
        duration: meta.duration || "3h 0m",
      },
    ],
    offerToken: "",
  };

  offer.offerToken = encodeFlightToken({
    id: offer.id,
    airline: offer.airline,
    airlineCode: offer.airlineCode,
    from: offer.from,
    to: offer.to,
    fromCode: offer.fromCode,
    toCode: offer.toCode,
    departAt: offer.departAt,
    arriveAt: offer.arriveAt,
    duration: offer.duration,
    stops: offer.stops,
    sourcePrice: offer.sourcePrice,
    salePrice: offer.salePrice,
    currency: offer.currency,
    cabin: offer.cabin,
    trip: offer.trip,
    adults: input.adults,
    children: input.children,
    infants: input.infants,
    segments: offer.segments,
  });

  return offer;
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

  const searchInput = {
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
  };

  let flights: LiveFlightOffer[] = [];
  let source: "skyscrapper" | "market" | "catalog" = "market";

  if (skyScrapperConfigured()) {
    const live = await searchSkyScrapperFlights(searchInput);
    if (live?.length) {
      flights = live;
      source = "skyscrapper";
    }
  }

  if (!flights.length) {
    flights = generateMarketFlights(searchInput);
    source = "market";
  }

  if (!flights.length) {
    const allFlights = await prisma.offer.findMany({ where: { type: "FLIGHT" }, take: 500 });
    flights = allFlights
      .filter((o) => matchesFlightRoute(parseFlightMetadata(o.metadata), o.title, from, to))
      .map((o) =>
        catalogToLive(o, {
          trip: searchInput.trip,
          cabin: searchInput.cabin,
          adults: searchInput.adults,
          children: searchInput.children,
          infants: searchInput.infants,
          from: searchInput.fromLabel,
          to: searchInput.toLabel,
          depart: searchInput.depart,
        }),
      );
    source = "catalog";
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
    fromCode,
    toCode,
    discountPct: 30,
    rapidApiOptional: skyScrapperConfigured(),
  });
}
