import type { FlightTokenPayload } from "./flight-token";

export function normalizeFlightPayload(flight: FlightTokenPayload): FlightTokenPayload {
  const outbound = flight.outbound;
  const firstSeg = flight.segments?.[0];
  const lastSeg = flight.segments?.[flight.segments.length - 1];

  return {
    ...flight,
    airline: flight.airline || outbound?.airline || firstSeg?.airline || "",
    from: flight.from || outbound?.from || firstSeg?.from || "",
    to: flight.to || outbound?.to || lastSeg?.to || "",
    fromCode: flight.fromCode || outbound?.fromCode || firstSeg?.fromCode || "",
    toCode: flight.toCode || outbound?.toCode || lastSeg?.toCode || "",
    departAt: flight.departAt || outbound?.departAt || firstSeg?.departAt || "",
    arriveAt: flight.arriveAt || outbound?.arriveAt || lastSeg?.arriveAt || "",
    duration: flight.duration || outbound?.duration || firstSeg?.duration || "",
  };
}

export function flightRouteLabel(flight: FlightTokenPayload): string {
  const f = normalizeFlightPayload(flight);
  const fromCode = f.outbound?.fromCode || f.fromCode;
  const toCode = f.outbound?.toCode || f.toCode;
  if (fromCode && toCode) return `${fromCode} → ${toCode}`;
  if (f.from && f.to) return `${f.from} → ${f.to}`;
  return "";
}

export type FlightBookingMeta = {
  type: string;
  airline?: string;
  route?: string;
  fromCode?: string;
  toCode?: string;
  departAt?: string;
  arriveAt?: string;
  cabin?: string;
  trip?: string;
  hotelTitle?: string;
};

export function parseFlightBookingMeta(raw: string | null | undefined): FlightBookingMeta | null {
  if (!raw?.trim().startsWith("{")) return null;
  try {
    const data = JSON.parse(raw) as FlightBookingMeta;
    if (data?.type === "live_flight" || data?.type === "live_flight_bundle") return data;
  } catch {
    /* ignore */
  }
  return null;
}
