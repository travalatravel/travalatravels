import { airlineName } from "./airline-names";
import { hashSeed } from "./flight-display";
import { getFlightPricing, applyFlightSalePrice } from "./flight-pricing";
import { encodeFlightToken } from "./flight-token";
import { generateMarketFlights } from "./flight-market-engine";
import type { LiveFlightOffer, LiveFlightSegment } from "./live-flight-types";
import type { CabinClass, TripType } from "./flight-types";

const API_URL = "https://partners.api.skyscanner.net/apiservices/v3/flights/indicative/search";

const CABIN_MULT: Record<CabinClass, number> = {
  economy: 1,
  premium_economy: 1.55,
  business: 2.75,
  first: 4.1,
};

type SkyDate = { year: number; month: number; day: number; hour?: number; minute?: number };

type SkyLeg = {
  originPlaceId?: string;
  destinationPlaceId?: string;
  departureDateTime?: SkyDate;
  marketingCarrierId?: string;
};

type SkyQuote = {
  minPrice?: { amount?: string | number };
  isDirect?: boolean;
  outboundLeg?: SkyLeg;
  inboundLeg?: SkyLeg;
};

type SkyCarrier = { name?: string; iata?: string; displayCode?: string };
type SkyPlace = { name?: string; iata?: string; entityId?: string };

function configured() {
  return Boolean(process.env.SKYSCANNER_API_KEY?.trim());
}

function parseIsoParts(iso: string): SkyDate {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  return { year: y, month: m, day: d };
}

function dateTimeToIso(dt?: SkyDate, fallbackDate?: string): string {
  if (!dt?.year) return fallbackDate ? `${fallbackDate}T09:00:00` : new Date().toISOString();
  const h = dt.hour ?? 9;
  const min = dt.minute ?? 0;
  return `${dt.year}-${String(dt.month).padStart(2, "0")}-${String(dt.day).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`;
}

function estimateDurationMin(fromCode: string, toCode: string, direct: boolean): number {
  const seed = hashSeed(`${fromCode}-${toCode}`);
  const base = 90 + (seed % 480);
  return direct ? base : base + 55 + (seed % 80);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function parseAmount(raw: string | number | undefined): number {
  const n = parseFloat(String(raw ?? "0"));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function placeLabel(places: Record<string, SkyPlace>, id: string | undefined, fallback: string, code: string) {
  if (id && places[id]?.name) return places[id].name!;
  return fallback;
}

function placeCode(places: Record<string, SkyPlace>, id: string | undefined, fallback: string) {
  if (id && places[id]?.iata) return places[id].iata!;
  return fallback;
}

function carrierFromId(carriers: Record<string, SkyCarrier>, id: string | undefined) {
  if (!id || !carriers[id]) return { code: "XX", name: "Airline" };
  const c = carriers[id];
  const code = c.iata || c.displayCode || "XX";
  return { code, name: c.name || airlineName(code) };
}

function buildOffer(
  quoteId: string,
  quote: SkyQuote,
  input: {
    fromLabel: string;
    toLabel: string;
    fromCode: string;
    toCode: string;
    depart: string;
    returnDate?: string;
    trip: TripType;
    cabin: CabinClass;
    adults: number;
    children: number;
    infants: number;
  },
  carriers: Record<string, SkyCarrier>,
  places: Record<string, SkyPlace>,
  index: number,
): LiveFlightOffer | null {
  const baseUsd = parseAmount(quote.minPrice?.amount);
  if (!baseUsd) return null;

  const pax = input.adults + input.children + Math.ceil(input.infants * 0.1);
  const cabinMult = CABIN_MULT[input.cabin] ?? 1;
  const sourcePrice = Math.round(baseUsd * pax * cabinMult * 100) / 100;
  const pricing = getFlightPricing(sourcePrice);

  const out = quote.outboundLeg;
  const carrier = carrierFromId(carriers, out?.marketingCarrierId);
  const fromCode = placeCode(places, out?.originPlaceId, input.fromCode);
  const toCode = placeCode(places, out?.destinationPlaceId, input.toCode);
  const from = placeLabel(places, out?.originPlaceId, input.fromLabel, fromCode);
  const to = placeLabel(places, out?.destinationPlaceId, input.toLabel, toCode);

  const departAt = dateTimeToIso(out?.departureDateTime, input.depart);
  const durMin = estimateDurationMin(fromCode, toCode, quote.isDirect !== false);
  const arriveDate = new Date(departAt);
  arriveDate.setMinutes(arriveDate.getMinutes() + durMin);
  const arriveAt = arriveDate.toISOString().slice(0, 19);
  const duration = formatDuration(durMin);
  const stops = quote.isDirect === false ? 1 : 0;

  const segment: LiveFlightSegment = {
    airline: carrier.name,
    airlineCode: carrier.code,
    flightNumber: `${carrier.code}${100 + (index % 800)}`,
    from,
    fromCode,
    to,
    toCode,
    departAt,
    arriveAt,
    duration,
  };

  const offer: LiveFlightOffer = {
    id: `skyscanner-${quoteId}`,
    airline: carrier.name,
    airlineCode: carrier.code,
    from,
    to,
    fromCode,
    toCode,
    departAt,
    arriveAt,
    duration,
    stops,
    sourcePrice: pricing.originalPrice,
    salePrice: pricing.salePrice,
    currency: "USD",
    cabin: input.cabin,
    trip: input.trip,
    segments: [segment],
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

function anchorMarketOffers(
  anchorSourcePrice: number,
  offers: LiveFlightOffer[],
  input: Parameters<typeof generateMarketFlights>[0],
): LiveFlightOffer[] {
  if (!offers.length || !anchorSourcePrice) return offers;
  const min = Math.min(...offers.map((o) => o.sourcePrice));
  if (!min) return offers;
  const ratio = anchorSourcePrice / min;
  return offers.map((o) => {
    const sourcePrice = Math.round(o.sourcePrice * ratio * 100) / 100;
    const salePrice = applyFlightSalePrice(sourcePrice);
    const updated = { ...o, sourcePrice, salePrice, id: `skyscanner-mkt-${o.id}` };
    updated.offerToken = encodeFlightToken({
      id: updated.id,
      airline: updated.airline,
      airlineCode: updated.airlineCode,
      from: updated.from,
      to: updated.to,
      fromCode: updated.fromCode,
      toCode: updated.toCode,
      departAt: updated.departAt,
      arriveAt: updated.arriveAt,
      duration: updated.duration,
      stops: updated.stops,
      sourcePrice: updated.sourcePrice,
      salePrice: updated.salePrice,
      currency: updated.currency,
      cabin: updated.cabin,
      trip: updated.trip,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      segments: updated.segments,
    });
    return updated;
  });
}

export function skyscannerConfigured() {
  return configured();
}

export async function searchSkyscannerIndicative(input: {
  fromCode: string;
  toCode: string;
  fromLabel: string;
  toLabel: string;
  depart: string;
  returnDate?: string;
  trip: TripType;
  cabin: CabinClass;
  adults: number;
  children: number;
  infants: number;
}): Promise<LiveFlightOffer[] | null> {
  if (!configured()) return null;

  const departParts = parseIsoParts(input.depart);
  const legs: Record<string, unknown>[] = [
    {
      originPlace: { queryPlace: { iata: input.fromCode } },
      destinationPlace: { queryPlace: { iata: input.toCode } },
      fixedDate: departParts,
    },
  ];

  if (input.trip === "roundtrip" && input.returnDate) {
    legs.push({
      originPlace: { queryPlace: { iata: input.toCode } },
      destinationPlace: { queryPlace: { iata: input.fromCode } },
      fixedDate: parseIsoParts(input.returnDate),
    });
  }

  const body = {
    query: {
      market: process.env.SKYSCANNER_MARKET || "US",
      locale: process.env.SKYSCANNER_LOCALE || "en-US",
      currency: "USD",
      queryLegs: legs,
    },
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.SKYSCANNER_API_KEY!,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      content?: {
        results?: {
          quotes?: Record<string, SkyQuote>;
          carriers?: Record<string, SkyCarrier>;
          places?: Record<string, SkyPlace>;
        };
      };
    };

    const results = json.content?.results;
    const quotes = results?.quotes || {};
    const carriers = results?.carriers || {};
    const places = results?.places || {};

    const parsed = Object.entries(quotes)
      .map(([id, q], i) => buildOffer(id, q, input, carriers, places, i))
      .filter((o): o is LiveFlightOffer => o !== null)
      .sort((a, b) => a.salePrice - b.salePrice);

    if (!parsed.length) return null;

    if (parsed.length >= 8) return parsed.slice(0, 24);

    const anchor = parsed[0].sourcePrice;
    const filled = anchorMarketOffers(
      anchor,
      generateMarketFlights({ ...input, count: 12 }),
      input,
    );

    const seen = new Set(parsed.map((o) => o.id));
    for (const o of filled) {
      if (parsed.length >= 16) break;
      if (!seen.has(o.id)) {
        parsed.push(o);
        seen.add(o.id);
      }
    }

    return parsed.sort((a, b) => a.salePrice - b.salePrice);
  } catch {
    return null;
  }
}
