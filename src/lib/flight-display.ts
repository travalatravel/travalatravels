import type { CabinClass, FlightMetadata, FlightSearchParams, TripType } from "./flight-types";
import { KNOWN_AIRPORTS } from "./sky-scrapper-airports";

function knownSkyIds(code?: string) {
  if (!code) return undefined;
  return KNOWN_AIRPORTS[code.trim().toUpperCase()];
}

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  economy: 1,
  premium_economy: 1.55,
  business: 2.8,
  first: 4.2,
};

export function parseFlightMetadata(raw: string | null | undefined): FlightMetadata {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as FlightMetadata;
  } catch {
    return {};
  }
}

export function hashSeed(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (Math.imul(31, h) + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function flightTimesForOffer(id: string, duration: string): { depart: string; arrive: string } {
  const h = hashSeed(id);
  const departH = 6 + (h % 14);
  const departM = (h % 12) * 5;
  const durMatch = duration.match(/(\d+)h\s*(\d+)?m?/);
  const durH = durMatch ? parseInt(durMatch[1], 10) : 3;
  const durM = durMatch && durMatch[2] ? parseInt(durMatch[2], 10) : 0;
  const arriveTotal = departH * 60 + departM + durH * 60 + durM;
  const arriveH = Math.floor(arriveTotal / 60) % 24;
  const arriveM = arriveTotal % 60;
  const fmt = (hh: number, mm: number) =>
    `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  return { depart: fmt(departH, departM), arrive: fmt(arriveH, arriveM) };
}

export function stopsForOffer(id: string): number {
  const n = hashSeed(id + "stops") % 10;
  if (n < 6) return 0;
  if (n < 9) return 1;
  return 2;
}

export function priceForFlight(
  basePrice: number,
  cabin: CabinClass,
  passengers: number,
  trip: TripType,
): number {
  const mult = CABIN_MULTIPLIER[cabin] ?? 1;
  const pax = Math.max(1, passengers);
  const round = trip === "roundtrip" ? 1.85 : 1;
  return Math.round(basePrice * mult * pax * round * 100) / 100;
}

export function matchesFlightRoute(
  meta: FlightMetadata,
  title: string,
  from: string,
  to: string,
): boolean {
  const f = from.trim().toLowerCase();
  const t = to.trim().toLowerCase();
  if (!f && !t) return true;

  const metaFrom = (meta.from || "").toLowerCase();
  const metaTo = (meta.to || "").toLowerCase();
  const titleL = title.toLowerCase();

  const fromOk = !f || metaFrom.includes(f) || titleL.includes(f);
  const toOk = !t || metaTo.includes(t) || titleL.includes(t);
  return fromOk && toOk;
}

export function buildFlightSearchQuery(params: FlightSearchParams): URLSearchParams {
  const fromKnown = knownSkyIds(params.fromCode);
  const toKnown = knownSkyIds(params.toCode);
  const fromSkyId = params.fromSkyId || fromKnown?.skyId;
  const fromEntityId = params.fromEntityId || fromKnown?.entityId;
  const toSkyId = params.toSkyId || toKnown?.skyId;
  const toEntityId = params.toEntityId || toKnown?.entityId;

  const sp = new URLSearchParams({ type: "flights" });
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.fromCode) sp.set("fromCode", params.fromCode);
  if (params.toCode) sp.set("toCode", params.toCode);
  if (fromSkyId) sp.set("fromSkyId", fromSkyId);
  if (fromEntityId) sp.set("fromEntityId", fromEntityId);
  if (toSkyId) sp.set("toSkyId", toSkyId);
  if (toEntityId) sp.set("toEntityId", toEntityId);
  sp.set("depart", params.depart);
  if (params.return && params.trip === "roundtrip") sp.set("return", params.return);
  sp.set("trip", params.trip);
  sp.set("adults", String(params.adults));
  sp.set("children", String(params.children));
  sp.set("infants", String(params.infants));
  sp.set("cabin", params.cabin);
  sp.set("guests", String(params.adults + params.children + params.infants));
  if (params.addHotel) sp.set("addHotel", "1");
  return sp;
}
