import type { CabinClass, TripType } from "./flight-types";
import type { LiveFlightOffer, LiveFlightSegment } from "./live-flight-types";

export type FlightTokenPayload = {
  id: string;
  airline: string;
  airlineCode: string;
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  departAt: string;
  arriveAt: string;
  duration: string;
  stops: number;
  sourcePrice: number;
  salePrice: number;
  currency: string;
  cabin: CabinClass;
  trip: TripType;
  adults: number;
  children: number;
  infants: number;
  segments: LiveFlightSegment[];
};

export function encodeFlightToken(payload: FlightTokenPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeFlightToken(token: string): FlightTokenPayload | null {
  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    const data = JSON.parse(json) as FlightTokenPayload;
    if (!data?.id || !data.sourcePrice || !data.salePrice) return null;
    return data;
  } catch {
    return null;
  }
}

export function tokenFromOffer(
  offer: LiveFlightOffer,
  pax: { adults: number; children: number; infants: number },
): string {
  return encodeFlightToken({
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
    adults: pax.adults,
    children: pax.children,
    infants: pax.infants,
    segments: offer.segments,
  });
}
