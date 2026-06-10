import type { LiveFlightOffer } from "./live-flight-types";
import type { CabinClass, TripType } from "./flight-types";

export type FlightOfferSearchContext = {
  from: string;
  to: string;
  fromCode?: string;
  toCode?: string;
  depart: string;
  returnDate?: string;
  trip: TripType;
  cabin: CabinClass;
  adults: number;
  children: number;
  infants: number;
  addHotel?: boolean;
};

export function buildFlightOfferHref(flight: LiveFlightOffer, ctx: FlightOfferSearchContext): string {
  const params = new URLSearchParams({
    token: flight.offerToken,
    from: ctx.from || flight.from,
    to: ctx.to || flight.to,
    fromCode: ctx.fromCode || flight.fromCode,
    toCode: ctx.toCode || flight.toCode,
    depart: ctx.depart || flight.departAt.slice(0, 10),
    trip: ctx.trip || flight.trip,
    cabin: ctx.cabin || flight.cabin,
    adults: String(ctx.adults),
    children: String(ctx.children),
    infants: String(ctx.infants),
  });
  if (ctx.returnDate) params.set("return", ctx.returnDate);
  if (ctx.addHotel) params.set("addHotel", "1");
  return `/flights/offer?${params.toString()}`;
}

export function buildFlightCheckoutHref(token: string, paymentMethod?: string): string {
  const params = new URLSearchParams({ token });
  if (paymentMethod) params.set("paymentMethod", paymentMethod);
  return `/flights/checkout?${params.toString()}`;
}
