import type { LiveFlightOffer } from "./live-flight-types";

const OUTBOUND_KEY = "travala:outboundFlightToken";
const OUTBOUND_OFFER_KEY = "travala:outboundFlightOffer";
const OFFER_KEY = "travala:offerFlightToken";

export function saveOutboundOffer(offer: LiveFlightOffer) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(OUTBOUND_OFFER_KEY, JSON.stringify(offer));
}

export function readOutboundOffer(): LiveFlightOffer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OUTBOUND_OFFER_KEY);
    return raw ? (JSON.parse(raw) as LiveFlightOffer) : null;
  } catch {
    return null;
  }
}

export function saveOutboundToken(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(OUTBOUND_KEY, token);
}

export function readOutboundToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(OUTBOUND_KEY) || "";
}

export function clearOutboundToken() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(OUTBOUND_KEY);
  sessionStorage.removeItem(OUTBOUND_OFFER_KEY);
}

export function saveOfferToken(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(OFFER_KEY, token);
}

export function readOfferToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(OFFER_KEY) || "";
}

export function clearOfferToken() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(OFFER_KEY);
}
