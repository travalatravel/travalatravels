import { getOfferPricing } from "./pricing";
import type { Offer } from "./types";

/** Extra hotel discount when booked together with a flight (Travala-style bundle) */
export const BUNDLE_HOTEL_EXTRA_DISCOUNT_PCT = 10;

export function bundleStayNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export function calcBundleHotelPrice(
  offer: Pick<Offer, "price" | "id" | "stars">,
  checkIn: string,
  checkOut: string,
  rooms: number,
): number {
  const nights = bundleStayNights(checkIn, checkOut);
  const base = offer.price * nights * rooms;
  const pricing = getOfferPricing(base, offer.id, offer.stars);
  const extra = 1 - BUNDLE_HOTEL_EXTRA_DISCOUNT_PCT / 100;
  return Math.round(pricing.salePrice * extra * 100) / 100;
}

export type BundleHotelSelection = {
  offerId: string;
  title: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  hotelTotal: number;
  nights: number;
};

export function bundleHotelFromOffer(
  offer: Offer,
  checkIn: string,
  checkOut: string,
  guests: number,
  rooms = 1,
): BundleHotelSelection {
  return {
    offerId: offer.id,
    title: offer.title,
    checkIn,
    checkOut,
    rooms,
    guests,
    hotelTotal: calcBundleHotelPrice(offer, checkIn, checkOut, rooms),
    nights: bundleStayNights(checkIn, checkOut),
  };
}

export function appendBundleHotelParams(
  params: URLSearchParams,
  bundle: BundleHotelSelection,
): URLSearchParams {
  params.set("hotelId", bundle.offerId);
  params.set("hotelCheckIn", bundle.checkIn);
  params.set("hotelCheckOut", bundle.checkOut);
  params.set("hotelRooms", String(bundle.rooms));
  params.set("hotelTotal", String(bundle.hotelTotal));
  return params;
}

export function parseBundleHotelFromParams(
  searchParams: URLSearchParams,
): BundleHotelSelection | null {
  const offerId = searchParams.get("hotelId");
  const checkIn = searchParams.get("hotelCheckIn");
  const checkOut = searchParams.get("hotelCheckOut");
  const hotelTotal = parseFloat(searchParams.get("hotelTotal") || "");
  if (!offerId || !checkIn || !checkOut || !Number.isFinite(hotelTotal)) return null;

  const rooms = Math.max(1, parseInt(searchParams.get("hotelRooms") || "1", 10));
  const guests = Math.max(1, parseInt(searchParams.get("guests") || "2", 10));

  return {
    offerId,
    title: searchParams.get("hotelTitle") || "Hotel",
    checkIn,
    checkOut,
    rooms,
    guests,
    hotelTotal,
    nights: bundleStayNights(checkIn, checkOut),
  };
}
