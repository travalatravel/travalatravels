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

export async function airScraperSearchFlights(
  input: AirScraperSearchInput,
): Promise<{ itineraries: Record<string, unknown>[]; complete: boolean }> {
  const url = buildSearchFlightsUrl(input);
  const res = await rapidApiFetch(url, { timeoutMs: 28000, retries: 1 });
  if (!res.ok) return { itineraries: [], complete: false };

  const json = (await res.json()) as {
    status?: boolean;
    data?: {
      context?: { status?: string };
      itineraries?: Record<string, unknown>[];
    };
  };

  if (json.status === false) return { itineraries: [], complete: false };

  const itineraries = json.data?.itineraries || [];
  const complete = json.data?.context?.status === "complete";
  return { itineraries, complete };
}
