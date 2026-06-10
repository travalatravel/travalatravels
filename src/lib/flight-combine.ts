import { decodeFlightToken, encodeFlightToken, type FlightTokenPayload } from "./flight-token";
import type { FlightLeg } from "./live-flight-types";

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
    segments: [...out.segments, ...ret.segments],
  });
}
