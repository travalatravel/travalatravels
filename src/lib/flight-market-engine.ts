import { airlineName } from "./airline-names";
import { hashSeed } from "./flight-display";
import { getFlightPricing } from "./flight-pricing";
import { encodeFlightToken } from "./flight-token";
import type { FlightLeg, LiveFlightOffer, LiveFlightSegment } from "./live-flight-types";
import type { CabinClass, TripType } from "./flight-types";

/** Approximate airport coordinates for market-rate estimation */
const AIRPORT_COORDS: Record<string, { lat: number; lon: number }> = {
  LON: { lat: 51.47, lon: -0.45 },
  PAR: { lat: 49.01, lon: 2.55 },
  NYC: { lat: 40.64, lon: -73.78 },
  DXB: { lat: 25.25, lon: 55.36 },
  BKK: { lat: 13.69, lon: 100.75 },
  SIN: { lat: 1.36, lon: 103.99 },
  TYO: { lat: 35.76, lon: 140.39 },
  LAX: { lat: 33.94, lon: -118.41 },
  LAS: { lat: 36.08, lon: -115.15 },
  SYD: { lat: -33.95, lon: 151.18 },
  MEL: { lat: -37.67, lon: 144.85 },
  FRA: { lat: 50.04, lon: 8.57 },
  BCN: { lat: 41.3, lon: 2.08 },
  HKG: { lat: 22.31, lon: 113.91 },
  SEL: { lat: 37.46, lon: 126.45 },
  AMS: { lat: 52.31, lon: 4.77 },
  ROM: { lat: 41.8, lon: 12.25 },
  MAD: { lat: 40.47, lon: -3.57 },
  IST: { lat: 41.28, lon: 28.75 },
  MIA: { lat: 25.8, lon: -80.29 },
  CHI: { lat: 41.98, lon: -87.9 },
  BOS: { lat: 42.37, lon: -71.02 },
  YTO: { lat: 43.68, lon: -79.61 },
  YVR: { lat: 49.19, lon: -123.18 },
  BER: { lat: 52.37, lon: 13.52 },
  MUC: { lat: 48.35, lon: 11.79 },
  VIE: { lat: 48.11, lon: 16.57 },
  ZRH: { lat: 47.46, lon: 8.55 },
  BRU: { lat: 50.9, lon: 4.48 },
  LIS: { lat: 38.77, lon: -9.13 },
  ATH: { lat: 37.94, lon: 23.94 },
  PRG: { lat: 50.1, lon: 14.26 },
  WAW: { lat: 52.17, lon: 20.97 },
  CPH: { lat: 55.62, lon: 12.66 },
  STO: { lat: 59.65, lon: 17.93 },
  OSL: { lat: 60.19, lon: 11.1 },
  HEL: { lat: 60.32, lon: 24.96 },
  DUB: { lat: 53.43, lon: -6.27 },
  MAN: { lat: 53.35, lon: -2.28 },
  DOH: { lat: 25.27, lon: 51.61 },
  AUH: { lat: 24.43, lon: 54.65 },
  RUH: { lat: 24.96, lon: 46.7 },
  CAI: { lat: 30.12, lon: 31.4 },
  JNB: { lat: -26.14, lon: 28.24 },
  BOM: { lat: 19.09, lon: 72.87 },
  DEL: { lat: 28.56, lon: 77.1 },
  DPS: { lat: -8.75, lon: 115.17 },
  HKT: { lat: 8.11, lon: 98.31 },
  KUL: { lat: 2.75, lon: 101.71 },
  JKT: { lat: -6.13, lon: 106.65 },
  MNL: { lat: 14.51, lon: 121.02 },
  TPE: { lat: 25.08, lon: 121.23 },
  SHA: { lat: 31.14, lon: 121.81 },
  BJS: { lat: 40.08, lon: 116.6 },
  OSA: { lat: 34.43, lon: 135.24 },
  HNL: { lat: 21.32, lon: -157.92 },
  SFO: { lat: 37.62, lon: -122.38 },
  SEA: { lat: 47.45, lon: -122.31 },
  DFW: { lat: 32.9, lon: -97.04 },
  ATL: { lat: 33.64, lon: -84.43 },
  ORL: { lat: 28.43, lon: -81.31 },
};

const CABIN_MULT: Record<CabinClass, number> = {
  economy: 1,
  premium_economy: 1.55,
  business: 2.75,
  first: 4.1,
};

const CARRIER_POOL = [
  "BA", "AF", "LH", "KL", "EK", "QR", "SQ", "TK", "AA", "UA", "DL", "IB", "LX", "AY", "SK",
];

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function estimateDistanceKm(fromCode: string, toCode: string): number {
  const a = AIRPORT_COORDS[fromCode.toUpperCase()];
  const b = AIRPORT_COORDS[toCode.toUpperCase()];
  if (a && b) return haversineKm(a, b);
  const seed = hashSeed(`${fromCode}-${toCode}`);
  return 800 + (seed % 8200);
}

function estimateBaseFareUsd(km: number, pax: number): number {
  const perKm = km < 1500 ? 0.14 : km < 4000 ? 0.1 : 0.07;
  const base = Math.max(89, km * perKm);
  const demand = 1 + (hashSeed(`demand-${km}`) % 18) / 100;
  return Math.round(base * demand * pax * 100) / 100;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function isoAt(date: string, hour: number, minute: number): string {
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

export function generateMarketFlights(input: {
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
  count?: number;
}): LiveFlightOffer[] {
  const pax = input.adults + input.children + input.infants;
  const km = estimateDistanceKm(input.fromCode, input.toCode);
  const flightMin = Math.max(55, Math.round((km / 850) * 60 + 35));
  const roundMult = input.trip === "roundtrip" ? 1.82 : 1;
  const cabinMult = CABIN_MULT[input.cabin] ?? 1;
  const baseTotal = estimateBaseFareUsd(km, pax) * roundMult * cabinMult;
  const n = input.count ?? 14;

  const paxMeta = {
    adults: input.adults,
    children: input.children,
    infants: input.infants,
  };

  const offers: LiveFlightOffer[] = [];

  for (let i = 0; i < n; i++) {
    const seed = `${input.fromCode}-${input.toCode}-${input.depart}-${i}`;
    const h = hashSeed(seed);
    const carrier = CARRIER_POOL[h % CARRIER_POOL.length];
    const stops = h % 9 === 0 ? 2 : h % 4 === 0 ? 1 : 0;
    const priceVar = 0.88 + (h % 28) / 100;
    const sourcePrice = Math.round(baseTotal * priceVar * 100) / 100;
    const pricing = getFlightPricing(sourcePrice);

    const departH = 6 + (h % 14);
    const departM = (h % 12) * 5;
    const totalMin = flightMin + stops * (45 + (h % 40));
    const arriveTotal = departH * 60 + departM + totalMin;
    const arriveH = Math.floor(arriveTotal / 60) % 24;
    const arriveM = arriveTotal % 60;

    const departAt = isoAt(input.depart, departH, departM);
    const arriveAt = isoAt(input.depart, arriveH, arriveM);
    const duration = formatDuration(totalMin);

    const segment: LiveFlightSegment = {
      airline: airlineName(carrier),
      airlineCode: carrier,
      flightNumber: `${carrier}${100 + (h % 899)}`,
      from: input.fromLabel,
      fromCode: input.fromCode,
      to: input.toLabel,
      toCode: input.toCode,
      departAt,
      arriveAt,
      duration,
    };

    const outbound: FlightLeg = {
      airline: segment.airline,
      airlineCode: segment.airlineCode,
      flightNumber: segment.flightNumber,
      from: segment.from,
      fromCode: segment.fromCode,
      to: segment.to,
      toCode: segment.toCode,
      departAt,
      arriveAt,
      duration,
      stops,
    };

    let returnLeg: FlightLeg | undefined;
    const segments: LiveFlightSegment[] = [segment];

    if (input.trip === "roundtrip" && input.returnDate) {
      const rh = hashSeed(`${seed}-return`);
      const retCarrier = CARRIER_POOL[(rh + 3) % CARRIER_POOL.length];
      const retStops = rh % 7 === 0 ? 1 : rh % 11 === 0 ? 2 : 0;
      const retDepartH = 7 + (rh % 12);
      const retDepartM = (rh % 10) * 5;
      const retTotalMin = flightMin + retStops * (40 + (rh % 35));
      const retArriveTotal = retDepartH * 60 + retDepartM + retTotalMin;
      const retArriveH = Math.floor(retArriveTotal / 60) % 24;
      const retArriveM = retArriveTotal % 60;
      const retDepartAt = isoAt(input.returnDate, retDepartH, retDepartM);
      const retArriveAt = isoAt(input.returnDate, retArriveH, retArriveM);
      const retDuration = formatDuration(retTotalMin);

      const returnSegment: LiveFlightSegment = {
        airline: airlineName(retCarrier),
        airlineCode: retCarrier,
        flightNumber: `${retCarrier}${200 + (rh % 799)}`,
        from: input.toLabel,
        fromCode: input.toCode,
        to: input.fromLabel,
        toCode: input.fromCode,
        departAt: retDepartAt,
        arriveAt: retArriveAt,
        duration: retDuration,
      };

      returnLeg = {
        airline: returnSegment.airline,
        airlineCode: returnSegment.airlineCode,
        flightNumber: returnSegment.flightNumber,
        from: returnSegment.from,
        fromCode: returnSegment.fromCode,
        to: returnSegment.to,
        toCode: returnSegment.toCode,
        departAt: retDepartAt,
        arriveAt: retArriveAt,
        duration: retDuration,
        stops: retStops,
      };
      segments.push(returnSegment);
    }

    const offer: LiveFlightOffer = {
      id: `market-${input.fromCode}-${input.toCode}-${i}`,
      airline: airlineName(carrier),
      airlineCode: carrier,
      from: input.fromLabel,
      to: input.toLabel,
      fromCode: input.fromCode,
      toCode: input.toCode,
      departAt,
      arriveAt,
      duration,
      stops,
      outbound,
      returnLeg,
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
      returnLeg: offer.returnLeg,
      sourcePrice: offer.sourcePrice,
      salePrice: offer.salePrice,
      currency: offer.currency,
      cabin: offer.cabin,
      trip: offer.trip,
      ...paxMeta,
      segments: offer.segments,
    });

    offers.push(offer);
  }

  return offers.sort((a, b) => a.salePrice - b.salePrice);
}
