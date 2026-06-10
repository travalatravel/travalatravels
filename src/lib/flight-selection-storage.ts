const OUTBOUND_KEY = "travala:outboundFlightToken";

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
