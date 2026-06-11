/**
 * Air Scraper (Sky Scrapper) — RapidAPI v1
 * Host: sky-scrapper.p.rapidapi.com
 *
 * Route search:  GET /api/v1/flights/searchFlights
 * Airport lookup: GET /api/v1/flights/searchAirport
 * (searchFlightEverywhereDetails is deprecated — explore-only, not A→B routes)
 */
import { rapidApiConfigured, rapidApiFetch, rapidApiHost } from "./rapidapi-fetch";

export type AirScraperAirport = { skyId: string; entityId: string };

export type AirScraperSearchInput = {
  origin: AirScraperAirport;
  destination: AirScraperAirport;
  date: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  sortBy?: string;
};

const MARKET = () => process.env.RAPIDAPI_FLIGHT_MARKET || "de-DE";
const COUNTRY = () => process.env.RAPIDAPI_FLIGHT_COUNTRY || "DE";
const CURRENCY = () => process.env.RAPIDAPI_FLIGHT_CURRENCY || "EUR";

export function airScraperConfigured() {
  return rapidApiConfigured();
}

export function airScraperMarket() {
  return { market: MARKET(), country: COUNTRY(), currency: CURRENCY() };
}

export async function airScraperCheckServer(): Promise<boolean> {
  if (!airScraperConfigured()) return false;
  try {
    const res = await rapidApiFetch(`https://${rapidApiHost()}/api/v1/checkServer`, {
      timeoutMs: 8000,
      retries: 0,
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { status?: boolean };
    return Boolean(json.status);
  } catch {
    return false;
  }
}

export async function airScraperSearchAirport(
  query: string,
  locale = "de-DE",
): Promise<unknown[]> {
  if (!airScraperConfigured()) return [];
  const url = new URL(`https://${rapidApiHost()}/api/v1/flights/searchAirport`);
  url.searchParams.set("query", query.trim());
  url.searchParams.set("locale", locale);
  const res = await rapidApiFetch(url.toString(), { timeoutMs: 10000, retries: 0 });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: unknown[] };
  return json.data || [];
}

export function buildSearchFlightsUrl(input: AirScraperSearchInput): string {
  const url = new URL(`https://${rapidApiHost()}/api/v1/flights/searchFlights`);
  url.searchParams.set("originSkyId", input.origin.skyId);
  url.searchParams.set("destinationSkyId", input.destination.skyId);
  url.searchParams.set("originEntityId", input.origin.entityId);
  url.searchParams.set("destinationEntityId", input.destination.entityId);
  url.searchParams.set("date", input.date);
  url.searchParams.set("adults", String(input.adults));
  url.searchParams.set("cabinClass", input.cabinClass);
  url.searchParams.set("sortBy", input.sortBy || "best");
  url.searchParams.set("currency", CURRENCY());
  url.searchParams.set("market", MARKET());
  url.searchParams.set("countryCode", COUNTRY());
  if (input.children > 0) url.searchParams.set("childrens", String(input.children));
  if (input.infants > 0) url.searchParams.set("infants", String(input.infants));
  if (input.returnDate) url.searchParams.set("returnDate", input.returnDate);
  return url.toString();
}

type SearchFlightsResponse = {
  status?: boolean;
  data?: {
    context?: { status?: string; sessionId?: string };
    itineraries?: Record<string, unknown>[];
  };
};

async function fetchSearchFlightsOnce(
  url: string,
): Promise<{ itineraries: Record<string, unknown>[]; complete: boolean; ok: boolean }> {
  const res = await rapidApiFetch(url, { timeoutMs: 28000, retries: 0 });
  if (!res.ok) return { itineraries: [], complete: false, ok: false };

  let json: SearchFlightsResponse;
  try {
    json = (await res.json()) as SearchFlightsResponse;
  } catch {
    return { itineraries: [], complete: false, ok: false };
  }

  // The API intermittently answers HTTP 200 with status:false
  // ("Something went wrong...") or a malformed body — treat as retryable.
  if (json.status !== true || !json.data) {
    return { itineraries: [], complete: false, ok: false };
  }

  const itineraries = json.data.itineraries || [];
  const complete = json.data.context?.status === "complete";
  return { itineraries, complete, ok: true };
}

/**
 * v1 searchFlights with retries on flaky responses.
 *
 * Notes on this provider (sky-scrapper.p.rapidapi.com):
 * - There is NO working searchIncomplete/poll endpoint; the documented
 *   sessionId cannot be used to fetch more results.
 * - Each search returns at most ~8 itineraries regardless of sortBy —
 *   that is the full result set this API exposes.
 * - HTTP 200 responses randomly come back with status:false or garbage,
 *   so we retry the identical request a couple of times.
 */
export async function airScraperSearchFlights(
  input: AirScraperSearchInput,
): Promise<{ itineraries: Record<string, unknown>[]; complete: boolean }> {
  const url = buildSearchFlightsUrl(input);
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fetchSearchFlightsOnce(url);
      if (result.ok && result.itineraries.length) {
        return { itineraries: result.itineraries, complete: result.complete };
      }
      // ok but empty + complete → genuinely no inventory on this route/date
      if (result.ok && result.complete) {
        return { itineraries: [], complete: true };
      }
    } catch {
      // network/timeout — fall through to retry
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 1000 + attempt * 500));
    }
  }

  return { itineraries: [], complete: false };
}
