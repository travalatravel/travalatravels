import { combineFlightOffers, combineRoundtripTokens } from "./flight-combine";
import type { FlightOfferSearchContext } from "./flight-offer-link";
import { compactFlightToken, decodeFlightToken, tokenFromOffer, type FlightTokenPayload } from "./flight-token";
import type { FlightLeg, LiveFlightOffer } from "./live-flight-types";

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

export function outboundLegFromToken(token: string): FlightLeg | null {
  const payload = decodeFlightToken(token);
  return payload ? legFromPayload(payload) : null;
}

function buildOfferParams(
  token: string,
  ctx: FlightOfferSearchContext,
  outLeg: FlightLeg,
): string {
  const params = new URLSearchParams({
    token,
    from: ctx.from,
    to: ctx.to,
    fromCode: ctx.fromCode || outLeg.fromCode,
    toCode: ctx.toCode || outLeg.toCode,
    depart: ctx.depart,
    trip: "roundtrip",
    cabin: ctx.cabin,
    adults: String(ctx.adults),
    children: String(ctx.children),
    infants: String(ctx.infants),
  });
  if (ctx.returnDate) params.set("return", ctx.returnDate);
  if (ctx.addHotel) params.set("addHotel", "1");
  return `/flights/offer?${params.toString()}`;
}

/** Hinflug wählen → Rückflug-Suche (Token in URL, kein sessionStorage nötig) */
export function buildOutboundContinueUrl(currentSearch: string, outboundToken: string): string {
  const q = currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch;
  const params = new URLSearchParams(q);
  params.delete("outboundToken");
  params.delete("outTok");
  params.set("type", "flights");
  params.set("pickReturn", "1");
  params.set("outTok", compactFlightToken(outboundToken));
  return `/search?${params.toString()}`;
}

/** Rückflug wählen → Angebot (aus URL-Token + Rückflug) */
export function buildReturnOfferUrlFromTokens(
  outboundToken: string,
  returnOffer: LiveFlightOffer,
  ctx: FlightOfferSearchContext,
  pax: { adults: number; children: number; infants: number },
): string | null {
  const outPayload = decodeFlightToken(outboundToken);
  if (!outPayload) return null;

  const returnTok = returnOffer.offerToken || tokenFromOffer(returnOffer, pax);
  const combined = combineRoundtripTokens(outboundToken, returnTok);
  if (!combined) return null;

  return buildOfferParams(combined, ctx, legFromPayload(outPayload));
}

export function buildReturnOfferUrl(
  outboundOffer: LiveFlightOffer,
  returnOffer: LiveFlightOffer,
  ctx: FlightOfferSearchContext,
  pax: { adults: number; children: number; infants: number },
): string | null {
  try {
    const token = combineFlightOffers(outboundOffer, returnOffer, pax);
    const outLeg: FlightLeg = outboundOffer.outbound || {
      airline: outboundOffer.airline,
      airlineCode: outboundOffer.airlineCode,
      from: outboundOffer.from,
      to: outboundOffer.to,
      fromCode: outboundOffer.fromCode,
      toCode: outboundOffer.toCode,
      departAt: outboundOffer.departAt,
      arriveAt: outboundOffer.arriveAt,
      duration: outboundOffer.duration,
      stops: outboundOffer.stops,
    };
    return buildOfferParams(token, ctx, outLeg);
  } catch {
    return null;
  }
}
