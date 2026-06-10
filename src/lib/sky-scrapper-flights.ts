import { airlineName } from "./airline-names";
import { getFlightPricing } from "./flight-pricing";
import { encodeFlightToken } from "./flight-token";
import type { LiveFlightOffer, LiveFlightSegment } from "./live-flight-types";
import type { CabinClass, TripType } from "./flight-types";
import {
  resolveAirport,
  skyScrapperAirportConfigured,
  type AirportRef,
} from "./sky-scrapper-airports";

const HOST = process.env.RAPIDAPI_FLIGHT_HOST || "sky-scrapper.p.rapidapi.com";

type SkyRecord = Record<string, unknown>;

function configured() {
  return skyScrapperAirportConfigured();
}

function headers() {
  return {
    "X-RapidAPI-Host": HOST,
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
  };
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
            skyTime(seg.departure) || skyTime(leg.departure) || `${input.depart}T08:00:00`;
          const arriveAt =
            skyTime(seg.arrival) || skyTime(leg.arrival) || `${input.depart}T12:00:00`;
          return {
            airline: skyCarrierName(mkt, code),
            airlineCode: code,
            flightNumber: seg.flightNumber ? String(seg.flightNumber) : undefined,
            from: skyPlaceLabel(origin, input.fromLabel),
            fromCode: skyPlaceCode(origin, input.fromCode),
            to: skyPlaceLabel(destination, input.toLabel),
            toCode: skyPlaceCode(destination, input.toCode),
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
        const pricing = getFlightPricing(raw);
        const stops = Math.max(0, segments.length - 1);

        const duration = parseDuration(
          (leg.durationInMinutes as number | undefined) ?? (leg.duration as string | number),
        );
        const outbound = {
          airline: airlineName(carrier),
          airlineCode: carrier,
          flightNumber: first.flightNumber,
          from: input.fromLabel,
          fromCode: first.fromCode,
          to: input.toLabel,
          toCode: last.toCode,
          departAt: first.departAt,
          arriveAt: last.arriveAt,
          duration,
          stops,
        };

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
          duration,
          stops,
          outbound,
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
          outbound: offer.outbound,
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
