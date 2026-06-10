const OUTBOUND_KEY = "travala:outboundFlightToken";
const OFFER_KEY = "travala:offerFlightToken";

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
