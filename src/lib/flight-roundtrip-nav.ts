import { combineFlightOffers } from "./flight-combine";
import type { FlightOfferSearchContext } from "./flight-offer-link";
import type { FlightLeg, LiveFlightOffer } from "./live-flight-types";

export function buildOutboundContinueUrl(currentSearch: string): string {
  const params = new URLSearchParams(currentSearch);
  params.delete("outboundToken");
  params.set("type", "flights");
  params.set("pickReturn", "1");
  return `/search?${params.toString()}`;
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
  } catch {
    return null;
  }
}
