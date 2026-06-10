import type { CabinClass, TripType } from "./flight-types";
import type { FlightLeg, LiveFlightOffer, LiveFlightSegment } from "./live-flight-types";

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
  outbound?: FlightLeg;
  returnLeg?: FlightLeg;
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

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(token: string): string {
  let b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeFlightToken(payload: FlightTokenPayload): string {
  const json = JSON.stringify(payload);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8").toString("base64url");
  }
  return base64UrlEncode(new TextEncoder().encode(json));
}

export function decodeFlightToken(token: string): FlightTokenPayload | null {
  if (!token) return null;
  try {
    const json = base64UrlDecode(token);
    const data = JSON.parse(json) as FlightTokenPayload;
    if (!data?.id || data.sourcePrice == null || data.salePrice == null) return null;
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
    outbound: offer.outbound,
    returnLeg: offer.returnLeg,
    sourcePrice: offer.sourcePrice,
    salePrice: offer.salePrice,
    currency: offer.currency,
    cabin: offer.cabin,
    trip: offer.trip,
    adults: pax.adults,
    children: pax.children,
    infants: pax.infants,
    segments: offer.segments || [],
  });
}
