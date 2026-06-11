export type RapidApiPlan = "basic" | "pro";

/** Basic ($9.99): v1 searchFlights + searchAirport. Pro: v2 fallbacks. */
export function rapidApiPlan(): RapidApiPlan {
  const raw = process.env.RAPIDAPI_PLAN?.trim().toLowerCase();
  return raw === "pro" ? "pro" : "basic";
}

export function isBasicRapidApiPlan() {
  return rapidApiPlan() === "basic";
}

export function canUseV2FlightSearch() {
  return rapidApiPlan() === "pro";
}

export function canUseAirportSuggestApi() {
  return true;
}

export function rapidApiSearchRetries() {
  return isBasicRapidApiPlan() ? 1 : 2;
}
