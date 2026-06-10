import type { SearchSuggestion } from "./travala-suggest";

const HOST = process.env.RAPIDAPI_FLIGHT_HOST || "sky-scrapper.p.rapidapi.com";

export type AirportRef = { skyId: string; entityId: string };
type SkyRecord = Record<string, unknown>;

const airportCache = new Map<string, AirportRef>();

/** Well-known Skyscanner IDs — avoids extra searchAirport requests */
export const KNOWN_AIRPORTS: Record<string, AirportRef> = {
  LON: { skyId: "LOND", entityId: "27544008" },
  PAR: { skyId: "PARI", entityId: "27539733" },
  NYC: { skyId: "NYCA", entityId: "27537542" },
  DXB: { skyId: "DXBA", entityId: "27540851" },
  BKK: { skyId: "BKKT", entityId: "27536671" },
  SIN: { skyId: "SINS", entityId: "27546111" },
  TYO: { skyId: "TYOA", entityId: "27542089" },
  LAX: { skyId: "LAXA", entityId: "27536637" },
  FRA: { skyId: "FRAA", entityId: "27534206" },
  AMS: { skyId: "AMSA", entityId: "27534067" },
  BCN: { skyId: "BCNA", entityId: "27548283" },
  SYD: { skyId: "SYDA", entityId: "27546111" },
  BER: { skyId: "BER", entityId: "95673383" },
  MUC: { skyId: "MUC", entityId: "95673491" },
  ROM: { skyId: "ROMA", entityId: "27539793" },
  MAD: { skyId: "MADR", entityId: "27544856" },
  IST: { skyId: "ISTA", entityId: "27536470" },
  VIE: { skyId: "VIE", entityId: "95673577" },
  ZRH: { skyId: "ZRHA", entityId: "27547066" },
  CPH: { skyId: "CPHA", entityId: "27534118" },
  DUB: { skyId: "DUBL", entityId: "27540839" },
  HKG: { skyId: "HKGA", entityId: "27536566" },
  SEL: { skyId: "SELA", entityId: "27542089" },
};

function configured() {
  return Boolean(process.env.RAPIDAPI_KEY?.trim());
}

function headers() {
  return {
    "X-RapidAPI-Host": HOST,
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
  };
}

export function skyScrapperAirportConfigured() {
  return configured();
}

export function parseAirportSearchResult(item: unknown): AirportRef | null {
  if (!item || typeof item !== "object") return null;
  const row = item as SkyRecord;

  const params = (row.navigation as SkyRecord | undefined)?.relevantFlightParams as
    | SkyRecord
    | undefined;
  if (params?.skyId && params?.entityId) {
    return { skyId: String(params.skyId), entityId: String(params.entityId) };
  }

  if (row.skyId && row.entityId) {
    return { skyId: String(row.skyId), entityId: String(row.entityId) };
  }

  return null;
}

function iataFromPresentation(item: SkyRecord, ref: AirportRef): string | undefined {
  const presentation = item.presentation as SkyRecord | undefined;
  const title = String(presentation?.suggestionTitle || presentation?.title || "");
  const paren = title.match(/\(([A-Z]{3})\)/);
  if (paren?.[1]) return paren[1];
  if (/^[A-Z]{3}$/.test(ref.skyId)) return ref.skyId;
  return undefined;
}

export function airportItemToSuggestion(item: unknown, index: number): SearchSuggestion | null {
  const ref = parseAirportSearchResult(item);
  if (!ref) return null;

  const row = item as SkyRecord;
  const presentation = row.presentation as SkyRecord | undefined;
  const nav = (row.navigation as SkyRecord | undefined)?.relevantFlightParams as
    | SkyRecord
    | undefined;
  const title = String(presentation?.title || presentation?.suggestionTitle || ref.skyId);
  const subtitle = String(presentation?.subtitle || "");
  const placeType = String(nav?.flightPlaceType || "AIRPORT").toUpperCase();
  const kind = placeType === "CITY" ? "city" : "airport";
  const iata = iataFromPresentation(row, ref);

  return {
    id: `${ref.entityId}-${index}`,
    label: title,
    subtitle: subtitle || undefined,
    kind,
    query: title,
    searchQuery: title,
    iata,
    skyId: ref.skyId,
    entityId: ref.entityId,
  };
}

export async function suggestSkyScrapperAirports(
  query: string,
  limit = 8,
  locale = "en-US",
): Promise<SearchSuggestion[]> {
  if (!configured()) return [];

  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL(`https://${HOST}/api/v1/flights/searchAirport`);
  url.searchParams.set("query", trimmed);
  url.searchParams.set("locale", locale);

  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: unknown[] };
    const items = json.data || [];
    return items
      .slice(0, limit)
      .map((item, index) => airportItemToSuggestion(item, index))
      .filter((s): s is SearchSuggestion => s !== null);
  } catch {
    return [];
  }
}

export async function resolveAirport(keyword: string, iataCode: string): Promise<AirportRef | null> {
  const cacheKey = (iataCode || keyword).trim().toUpperCase();
  if (airportCache.has(cacheKey)) return airportCache.get(cacheKey)!;

  const known = KNOWN_AIRPORTS[cacheKey] || KNOWN_AIRPORTS[iataCode?.toUpperCase()];
  if (known) {
    airportCache.set(cacheKey, known);
    return known;
  }

  const q = keyword.trim() || iataCode;
  if (!q) return null;

  const suggestions = await suggestSkyScrapperAirports(q, 1);
  const ref =
    suggestions[0]?.skyId && suggestions[0]?.entityId
      ? { skyId: suggestions[0].skyId, entityId: suggestions[0].entityId }
      : null;
  if (!ref) return null;

  airportCache.set(cacheKey, ref);
  return ref;
}
