import { airlineName } from "./airline-names";
import { getFlightPricing } from "./flight-pricing";
import { encodeFlightToken } from "./flight-token";
import type { LiveFlightOffer, LiveFlightSegment } from "./live-flight-types";
import type { CabinClass, TripType } from "./flight-types";

const HOST = process.env.RAPIDAPI_FLIGHT_HOST || "sky-scrapper.p.rapidapi.com";

type AirportRef = { skyId: string; entityId: string };
const airportCache = new Map<string, AirportRef>();

/** Well-known Skyscanner IDs — avoids extra searchAirport requests */
const KNOWN_AIRPORTS: Record<string, AirportRef> = {
  LON: { skyId: "LOND", entityId: "27544008" },
  PAR: { skyId: "PARI", entityId: "27539733" },
  NYC: { skyId: "NYCA", entityId: "27537542" },
  DXB: { skyId: "DXBA", entityId: "27540851" },
  BKK: { skyId: "BKKT", entityId: "27536671" },
  SIN: { skyId: "SINS", entityId: "27546111" },
  TYO: { skyId: "TYOA", entityId: "27542089" },
  LAX: { skyId: "LAXA", entityId: "27536637" },
  FRA: { skyId: "FRAA", entityId: "27534206" },
  AMS: { skyId: "AMSA", entityId: "27534067" },
  BCN: { skyId: "BCNA", entityId: "27548283" },
  SYD: { skyId: "SYDA", entityId: "27546111" },
};

function configured() {
  return Boolean(process.env.RAPIDAPI_KEY?.trim());
}

function headers() {
  return {
    "X-RapidAPI-Host": HOST,
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
  };
}

async function resolveAirport(keyword: string, iataCode: string): Promise<AirportRef | null> {
  const cacheKey = (iataCode || keyword).trim().toUpperCase();
  if (airportCache.has(cacheKey)) return airportCache.get(cacheKey)!;

  const known = KNOWN_AIRPORTS[cacheKey] || KNOWN_AIRPORTS[iataCode?.toUpperCase()];
  if (known) {
    airportCache.set(cacheKey, known);
    return known;
  }

  const query = keyword.trim() || iataCode;
  if (!query) return null;

  const url = new URL(`https://${HOST}/api/v1/flights/searchAirport`);
  url.searchParams.set("query", query);
  url.searchParams.set("locale", "en-US");

  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: Array<{ skyId?: string; entityId?: string }>;
    };
    const first = json.data?.[0];
    if (!first?.skyId || !first?.entityId) return null;
    const ref = { skyId: first.skyId, entityId: first.entityId };
    airportCache.set(cacheKey, ref);
    return ref;
  } catch {
    return null;
  }
}

function parseDuration(raw: string | number | undefined): string {
  if (typeof raw === "number") {
    const h = Math.floor(raw / 60);
    const m = raw % 60;
    return `${h}h ${m}m`;
  }
  if (!raw) return "—";
  const s = String(raw);
  const hm = s.match(/(\d+)h\s*(\d+)?m?/i);
  if (hm) return `${hm[1]}h ${hm[2] || "0"}m`;
  return s;
}

const CABIN_PARAM: Record<CabinClass, string> = {
  economy: "economy",
  premium_economy: "premium_economy",
  business: "business",
  first: "first",
};

export function skyScrapperConfigured() {
  return configured();
}

export async function searchSkyScrapperFlights(input: {
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

  const origin = await resolveAirport(input.fromLabel, input.fromCode);
  const dest = await resolveAirport(input.toLabel, input.toCode);
  if (!origin || !dest) return null;

  const url = new URL(`https://${HOST}/api/v2/flights/searchFlights`);
  url.searchParams.set("originSkyId", origin.skyId);
  url.searchParams.set("destinationSkyId", dest.skyId);
  url.searchParams.set("originEntityId", origin.entityId);
  url.searchParams.set("destinationEntityId", dest.entityId);
  url.searchParams.set("date", input.depart);
  url.searchParams.set("cabinClass", CABIN_PARAM[input.cabin] || "economy");
  url.searchParams.set("adults", String(input.adults));
  url.searchParams.set("sortBy", "best");
  url.searchParams.set("currency", "USD");
  url.searchParams.set("market", "en-US");
  url.searchParams.set("countryCode", "US");
  if (input.trip === "roundtrip" && input.returnDate) {
    url.searchParams.set("returnDate", input.returnDate);
  }

  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { itineraries?: Record<string, unknown>[] } };
    const itineraries = json.data?.itineraries || [];
    const pax = { adults: input.adults, children: input.children, infants: input.infants };

    const offers = itineraries
      .slice(0, 30)
      .map((it, index) => {
        const priceObj = it.price as Record<string, unknown> | undefined;
        const raw = parseFloat(String(priceObj?.raw ?? priceObj?.amount ?? 0));
        if (!raw || raw <= 0) return null;

        const legs = (it.legs as Record<string, unknown>[]) || [];
        const leg = legs[0];
        if (!leg) return null;

        const segmentsRaw = (leg.segments as Record<string, unknown>[]) || [];
        const segments: LiveFlightSegment[] = segmentsRaw.map((seg) => {
          const dep = seg.departure as Record<string, string> | undefined;
          const arr = seg.arrival as Record<string, string> | undefined;
          const mkt = seg.marketingCarrier as Record<string, string> | undefined;
          const op = seg.operatingCarrier as Record<string, string> | undefined;
          const code = String(mkt?.code || op?.code || "XX");
          return {
            airline: airlineName(code),
            airlineCode: code,
            flightNumber: seg.flightNumber ? String(seg.flightNumber) : undefined,
            from: dep?.city || input.fromLabel,
            fromCode: dep?.airportCode || input.fromCode,
            to: arr?.city || input.toLabel,
            toCode: arr?.airportCode || input.toCode,
            departAt: dep?.time || `${input.depart}T08:00:00`,
            arriveAt: arr?.time || `${input.depart}T12:00:00`,
            duration: parseDuration(seg.duration as string | number),
          };
        });

        const first = segments[0];
        const last = segments[segments.length - 1];
        if (!first || !last) return null;

        const carrier = first.airlineCode;
        const pricing = getFlightPricing(raw);
        const stops = Math.max(0, segments.length - 1);

        const offer: LiveFlightOffer = {
          id: String(it.id || `sky-${index}`),
          airline: airlineName(carrier),
          airlineCode: carrier,
          from: input.fromLabel,
          to: input.toLabel,
          fromCode: first.fromCode,
          toCode: last.toCode,
          departAt: first.departAt,
          arriveAt: last.arriveAt,
          duration: parseDuration(leg.duration as string | number),
          stops,
          sourcePrice: pricing.originalPrice,
          salePrice: pricing.salePrice,
          currency: "USD",
          cabin: input.cabin,
          trip: input.trip,
          segments,
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
          ...pax,
          segments: offer.segments,
        });

        return offer;
      })
      .filter((o): o is LiveFlightOffer => o !== null)
      .sort((a, b) => a.salePrice - b.salePrice);

    return offers.length ? offers : null;
  } catch {
    return null;
  }
}
