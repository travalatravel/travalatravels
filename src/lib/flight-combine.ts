import { decodeFlightToken, encodeFlightToken, type FlightTokenPayload } from "./flight-token";
import type { FlightLeg, LiveFlightOffer, LiveFlightSegment } from "./live-flight-types";

function slimSegments(offer: LiveFlightOffer): LiveFlightSegment[] {
  const first = offer.segments?.[0];
  if (first) return [first];
  return [
    {
      airline: offer.airline,
      airlineCode: offer.airlineCode,
      from: offer.from,
      fromCode: offer.fromCode,
      to: offer.to,
      toCode: offer.toCode,
      departAt: offer.departAt,
      arriveAt: offer.arriveAt,
      duration: offer.duration,
    },
  ];
}

function legFromPayload(payload: FlightTokenPayload): FlightLeg {
  if (payload.outbound) return payload.outbound;
  return {
    airline: payload.airline,
    airlineCode: payload.airlineCode,
    from: payload.from,
    to: payload.to,
    fromCode: payload.fromCode,
    toCode: payload.toCode,
    departAt: payload.departAt,
    arriveAt: payload.arriveAt,
    duration: payload.duration,
    stops: payload.stops,
  };
}

function legFromOffer(offer: LiveFlightOffer): FlightLeg {
  if (offer.outbound) return offer.outbound;
  return {
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
    flightNumber: offer.segments?.[0]?.flightNumber,
  };
}

/** Combine two live offers directly — no token decode required */
export function combineFlightOffers(
  outboundOffer: LiveFlightOffer,
  returnOffer: LiveFlightOffer,
  pax: { adults: number; children: number; infants: number },
): string {
  const outbound = legFromOffer(outboundOffer);
  const returnLeg = legFromOffer(returnOffer);

  return encodeFlightToken({
    id: `${outboundOffer.id}+${returnOffer.id}`,
    airline: outbound.airline,
    airlineCode: outbound.airlineCode,
    from: outbound.from,
    to: outbound.to,
    fromCode: outbound.fromCode,
    toCode: outbound.toCode,
    departAt: outbound.departAt,
    arriveAt: returnLeg.arriveAt,
    duration: outbound.duration,
    stops: outbound.stops,
    outbound,
    returnLeg,
    sourcePrice: outboundOffer.sourcePrice + returnOffer.sourcePrice,
    salePrice: outboundOffer.salePrice + returnOffer.salePrice,
    currency: outboundOffer.currency || "USD",
    cabin: outboundOffer.cabin,
    trip: "roundtrip",
    adults: pax.adults,
    children: pax.children,
    infants: pax.infants,
    segments: [...slimSegments(outboundOffer), ...slimSegments(returnOffer)],
  });
}

export function combineRoundtripTokens(
  outboundToken: string,
  returnToken: string,
): string | null {
  const out = decodeFlightToken(outboundToken);
  const ret = decodeFlightToken(returnToken);
  if (!out || !ret) return null;

  const outbound = legFromPayload(out);
  const returnLeg = legFromPayload(ret);

  return encodeFlightToken({
    id: `${out.id}+${ret.id}`,
    airline: outbound.airline,
    airlineCode: outbound.airlineCode,
    from: outbound.from,
    to: outbound.to,
    fromCode: outbound.fromCode,
    toCode: outbound.toCode,
    departAt: outbound.departAt,
    arriveAt: returnLeg.arriveAt,
    duration: outbound.duration,
    stops: outbound.stops,
    outbound,
    returnLeg,
    sourcePrice: out.sourcePrice + ret.sourcePrice,
    salePrice: out.salePrice + ret.salePrice,
    currency: out.currency,
    cabin: out.cabin,
    trip: "roundtrip",
    adults: out.adults,
    children: out.children,
    infants: out.infants,
    segments: [...(out.segments || []), ...(ret.segments || [])],
  });
}
