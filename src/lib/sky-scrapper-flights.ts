import { airlineName } from "./airline-names";
import { getFlightPricing } from "./flight-pricing";
import { encodeFlightToken } from "./flight-token";
import type { FlightLeg, LiveFlightOffer, LiveFlightSegment } from "./live-flight-types";
import type { CabinClass, TripType } from "./flight-types";
import { rapidApiConfigured, rapidApiFetch, rapidApiHost } from "./rapidapi-fetch";
import {
  dedupeSearch,
  getCachedSearch,
  getStaleSearch,
  setCachedSearch,
} from "./sky-scrapper-cache";
import {
  resolveAirport,
  skyScrapperAirportConfigured,
  type AirportRef,
} from "./sky-scrapper-airports";

type SkyRecord = Record<string, unknown>;

const MARKET = process.env.RAPIDAPI_FLIGHT_MARKET || "de-DE";
const COUNTRY = process.env.RAPIDAPI_FLIGHT_COUNTRY || "DE";
const CURRENCY = process.env.RAPIDAPI_FLIGHT_CURRENCY || "EUR";

function configured() {
  return skyScrapperAirportConfigured();
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

function skyTime(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "time" in value) {
    return String((value as { time?: string }).time || "");
  }
  return "";
}

function skyCarrierCode(carrier: SkyRecord | undefined): string {
  if (!carrier) return "XX";
  return String(carrier.alternateId || carrier.displayCode || carrier.code || "XX");
}

function skyCarrierName(carrier: SkyRecord | undefined, code: string): string {
  if (carrier?.name) return String(carrier.name);
  return airlineName(code);
}

function skyPlaceCode(place: SkyRecord | undefined, fallback: string): string {
  if (!place) return fallback;
  return String(place.displayCode || place.flightPlaceId || place.id || fallback);
}

function skyPlaceLabel(place: SkyRecord | undefined, fallback: string): string {
  if (!place) return fallback;
  return String(place.name || place.city || fallback);
}

function parseSkyLeg(
  leg: SkyRecord,
  defaults: {
    fromLabel: string;
    toLabel: string;
    fromCode: string;
    toCode: string;
    departDate: string;
  },
): { segments: LiveFlightSegment[]; summary: FlightLeg } | null {
  const legOrigin = leg.origin as SkyRecord | undefined;
  const legDestination = leg.destination as SkyRecord | undefined;
  const segmentsRaw = (leg.segments as SkyRecord[]) || [];
  const segments: LiveFlightSegment[] = segmentsRaw.map((seg) => {
    const mkt = seg.marketingCarrier as SkyRecord | undefined;
    const op = seg.operatingCarrier as SkyRecord | undefined;
    const code = skyCarrierCode(mkt) !== "XX" ? skyCarrierCode(mkt) : skyCarrierCode(op);
    const origin = (seg.origin as SkyRecord | undefined) || legOrigin;
    const destination = (seg.destination as SkyRecord | undefined) || legDestination;
    const departAt =
      skyTime(seg.departure) || skyTime(leg.departure) || `${defaults.departDate}T08:00:00`;
    const arriveAt =
      skyTime(seg.arrival) || skyTime(leg.arrival) || `${defaults.departDate}T12:00:00`;
    return {
      airline: skyCarrierName(mkt, code),
      airlineCode: code,
      flightNumber: seg.flightNumber ? String(seg.flightNumber) : undefined,
      from: skyPlaceLabel(origin, defaults.fromLabel),
      fromCode: skyPlaceCode(origin, defaults.fromCode),
      to: skyPlaceLabel(destination, defaults.toLabel),
      toCode: skyPlaceCode(destination, defaults.toCode),
      departAt,
      arriveAt,
      duration: parseDuration(
        (seg.durationInMinutes as number | undefined) ??
          (seg.duration as string | number | undefined),
      ),
    };
  });

  const first = segments[0];
  const last = segments[segments.length - 1];
  if (!first || !last) return null;

  const carrier = first.airlineCode;
  const stops = Math.max(0, segments.length - 1);
  const duration = parseDuration(
    (leg.durationInMinutes as number | undefined) ?? (leg.duration as string | number),
  );

  return {
    segments,
    summary: {
      airline: airlineName(carrier),
      airlineCode: carrier,
      flightNumber: first.flightNumber,
      from: first.from,
      fromCode: first.fromCode,
      to: last.to,
      toCode: last.toCode,
      departAt: first.departAt,
      arriveAt: last.arriveAt,
      duration,
      stops,
    },
  };
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

function buildSearchUrl(
  origin: AirportRef,
  dest: AirportRef,
  input: {
    depart: string;
    returnDate?: string;
    trip: TripType;
    cabin: CabinClass;
    adults: number;
    children: number;
    infants: number;
  },
  path: "v1" | "v1complete" | "v2",
) {
  const endpoint =
    path === "v1"
      ? `/api/v1/flights/searchFlights`
      : path === "v2"
        ? `/api/v2/flights/searchFlights`
        : `/api/v1/flights/searchFlightsComplete`;
  const url = new URL(`https://${rapidApiHost()}${endpoint}`);
  url.searchParams.set("originSkyId", origin.skyId);
  url.searchParams.set("destinationSkyId", dest.skyId);
  url.searchParams.set("originEntityId", origin.entityId);
  url.searchParams.set("destinationEntityId", dest.entityId);
  url.searchParams.set("date", input.depart);
  url.searchParams.set("cabinClass", CABIN_PARAM[input.cabin] || "economy");
  url.searchParams.set("adults", String(input.adults));
  url.searchParams.set("sortBy", "best");
  url.searchParams.set("currency", CURRENCY);
  url.searchParams.set("market", MARKET);
  url.searchParams.set("countryCode", COUNTRY);
  if (input.children > 0) url.searchParams.set("childrens", String(input.children));
  if (input.infants > 0) url.searchParams.set("infants", String(input.infants));
  if (input.trip === "roundtrip" && input.returnDate) {
    url.searchParams.set("returnDate", input.returnDate);
  }
  return url.toString();
}

function searchCacheKey(
  origin: AirportRef,
  dest: AirportRef,
  input: {
    depart: string;
    returnDate?: string;
    trip: TripType;
    cabin: CabinClass;
    adults: number;
    children: number;
    infants: number;
  },
) {
  return [
    origin.skyId,
    origin.entityId,
    dest.skyId,
    dest.entityId,
    input.depart,
    input.returnDate || "",
    input.trip,
    input.cabin,
    input.adults,
    input.children,
    input.infants,
    MARKET,
  ].join("|");
}

async function fetchItineraries(url: string): Promise<Record<string, unknown>[]> {
  const res = await rapidApiFetch(url, { timeoutMs: 25000, retries: 2 });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: { itineraries?: Record<string, unknown>[] } };
  return json.data?.itineraries || [];
}

function mapItineraries(
  itineraries: Record<string, unknown>[],
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
): LiveFlightOffer[] {
  const pax = { adults: input.adults, children: input.children, infants: input.infants };

  return itineraries
    .slice(0, 30)
    .map((it, index) => {
      const priceObj = it.price as Record<string, unknown> | undefined;
      const raw = parseFloat(String(priceObj?.raw ?? priceObj?.amount ?? 0));
      if (!raw || raw <= 0) return null;

      const legs = (it.legs as Record<string, unknown>[]) || [];
      const outboundData = parseSkyLeg(legs[0] as SkyRecord, {
        fromLabel: input.fromLabel,
        toLabel: input.toLabel,
        fromCode: input.fromCode,
        toCode: input.toCode,
        departDate: input.depart,
      });
      if (!outboundData) return null;

      let returnLeg: FlightLeg | undefined;
      const segments: LiveFlightSegment[] = [...outboundData.segments];

      if (input.trip === "roundtrip" && input.returnDate && legs[1]) {
        const returnData = parseSkyLeg(legs[1] as SkyRecord, {
          fromLabel: input.toLabel,
          toLabel: input.fromLabel,
          fromCode: input.toCode,
          toCode: input.fromCode,
          departDate: input.returnDate,
        });
        if (returnData) {
          returnLeg = returnData.summary;
          segments.push(...returnData.segments);
        }
      }

      const outbound = outboundData.summary;
      const first = segments[0];
      if (!first) return null;

      const carrier = outbound.airlineCode;
      const pricing = getFlightPricing(raw);

      const offer: LiveFlightOffer = {
        id: String(it.id || `sky-${index}`),
        airline: outbound.airline,
        airlineCode: carrier,
        from: input.fromLabel,
        to: input.toLabel,
        fromCode: outbound.fromCode,
        toCode: outbound.toCode,
        departAt: outbound.departAt,
        arriveAt: returnLeg?.arriveAt ?? outbound.arriveAt,
        duration: outbound.duration,
        stops: outbound.stops,
        outbound,
        returnLeg,
        sourcePrice: pricing.originalPrice,
        salePrice: pricing.salePrice,
        currency: CURRENCY,
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
        outbound: offer.outbound,
        returnLeg: offer.returnLeg,
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
}

async function runSearch(
  origin: AirportRef,
  dest: AirportRef,
  input: Parameters<typeof searchSkyScrapperFlights>[0],
): Promise<LiveFlightOffer[] | null> {
  const key = searchCacheKey(origin, dest, input);
  const cached = getCachedSearch<LiveFlightOffer[] | null>(key);
  if (cached) return cached;

  return dedupeSearch(key, async () => {
    // Basic RapidAPI plans usually include v1 only (v2 often returns 403).
    let itineraries = await fetchItineraries(
      buildSearchUrl(origin, dest, input, "v1"),
    );

    if (!itineraries.length) {
      itineraries = await fetchItineraries(
        buildSearchUrl(origin, dest, input, "v1complete"),
      );
    }

    if (!itineraries.length) {
      itineraries = await fetchItineraries(
        buildSearchUrl(origin, dest, input, "v2"),
      );
    }

    if (!itineraries.length) {
      const stale = getStaleSearch<LiveFlightOffer[] | null>(key);
      if (stale?.length) return stale;
      return null;
    }

    const offers = mapItineraries(itineraries, input);
    if (!offers.length) return null;
    setCachedSearch(key, offers);
    return offers;
  });
}

export async function searchSkyScrapperFlights(input: {
  fromCode: string;
  toCode: string;
  fromLabel: string;
  toLabel: string;
  fromSky?: AirportRef;
  toSky?: AirportRef;
  depart: string;
  returnDate?: string;
  trip: TripType;
  cabin: CabinClass;
  adults: number;
  children: number;
  infants: number;
}): Promise<LiveFlightOffer[] | null> {
  if (!configured()) return null;

  const origin = input.fromSky ?? (await resolveAirport(input.fromLabel, input.fromCode));
  const dest = input.toSky ?? (await resolveAirport(input.toLabel, input.toCode));
  if (!origin || !dest) return null;

  try {
    return await runSearch(origin, dest, input);
  } catch {
    const key = searchCacheKey(origin, dest, input);
    const stale = getStaleSearch<LiveFlightOffer[] | null>(key);
    return stale?.length ? stale : null;
  }
}
