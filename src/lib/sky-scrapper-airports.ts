import { POPULAR_AIRPORTS } from "@/data/popular-airports";
import { resolveIataCode } from "./iata-codes";
import { canUseAirportSuggestApi } from "./rapidapi-plan";
import type { SearchSuggestion } from "./travala-suggest";
import { rapidApiConfigured, rapidApiFetch, rapidApiHost } from "./rapidapi-fetch";
import { getCachedAirport, setCachedAirport } from "./sky-scrapper-cache";

export type AirportRef = { skyId: string; entityId: string };
type SkyRecord = Record<string, unknown>;

/** Skyscanner IDs for route search — synced with Air Scraper v1 searchAirport */
export const KNOWN_AIRPORTS: Record<string, AirportRef> = {
  LON: { skyId: "LOND", entityId: "27544008" },
  PAR: { skyId: "PARI", entityId: "27539733" },
  NYC: { skyId: "NYCA", entityId: "27537542" },
  DXB: { skyId: "DXBA", entityId: "27540839" },
  BKK: { skyId: "BKKT", entityId: "27536671" },
  SIN: { skyId: "SINS", entityId: "27546111" },
  TYO: { skyId: "TYOA", entityId: "27542089" },
  LAX: { skyId: "LAXA", entityId: "27536211" },
  LAS: { skyId: "LASA", entityId: "27542715" },
  FRA: { skyId: "FRAN", entityId: "27541706" },
  AMS: { skyId: "AMS", entityId: "95565044" },
  BCN: { skyId: "BCN", entityId: "95565085" },
  SYD: { skyId: "SYDA", entityId: "27547097" },
  MEL: { skyId: "MELA", entityId: "27544855" },
  BER: { skyId: "BER", entityId: "95673383" },
  MUC: { skyId: "MUC", entityId: "95673491" },
  HAM: { skyId: "HAMB", entityId: "27536295" },
  DUS: { skyId: "DUS", entityId: "95673545" },
  CGN: { skyId: "CGN", entityId: "95673544" },
  STR: { skyId: "STR", entityId: "95673677" },
  ROM: { skyId: "ROME", entityId: "27539793" },
  MAD: { skyId: "MAD", entityId: "95565077" },
  IST: { skyId: "ISTA", entityId: "27542903" },
  VIE: { skyId: "VIE", entityId: "95673444" },
  ZRH: { skyId: "ZRH", entityId: "95673856" },
  CPH: { skyId: "CPH", entityId: "95673519" },
  DUB: { skyId: "DUB", entityId: "95673529" },
  HKG: { skyId: "HKG", entityId: "128668132" },
  SEL: { skyId: "SELA", entityId: "27538638" },
  ICN: { skyId: "SELA", entityId: "27538638" },
  MIA: { skyId: "MIAA", entityId: "27536644" },
  CHI: { skyId: "CHIA", entityId: "27544891" },
  BOS: { skyId: "BOSA", entityId: "27539525" },
  BRU: { skyId: "BRUS", entityId: "27539565" },
  LIS: { skyId: "LIS", entityId: "95565055" },
  ATH: { skyId: "ATH", entityId: "95673624" },
  PRG: { skyId: "PRG", entityId: "95673502" },
  WAW: { skyId: "WARS", entityId: "27547454" },
  STO: { skyId: "STOC", entityId: "27539477" },
  OSL: { skyId: "OSLO", entityId: "27538634" },
  HEL: { skyId: "HEL", entityId: "95673700" },
  MAN: { skyId: "MAN", entityId: "95673540" },
  DOH: { skyId: "DOH", entityId: "95673852" },
  AUH: { skyId: "AUH", entityId: "95673509" },
  SFO: { skyId: "SFO", entityId: "95673577" },
  SEA: { skyId: "SEAA", entityId: "27538444" },
  DFW: { skyId: "DFWA", entityId: "27536457" },
  YTO: { skyId: "YTOA", entityId: "27536640" },
  YVR: { skyId: "YVRA", entityId: "27537411" },
};

for (const item of POPULAR_AIRPORTS) {
  const code = item.iata?.toUpperCase();
  if (code && item.skyId && item.entityId) {
    KNOWN_AIRPORTS[code] = { skyId: item.skyId, entityId: item.entityId };
  }
}

export function skyScrapperAirportConfigured() {
  return rapidApiConfigured();
}

/** Resolve airport locally — no API call (works on Basic plan). */
export function findKnownAirport(label: string, iataCode?: string): AirportRef | null {
  const iata = (iataCode?.trim().toUpperCase() || resolveIataCode(label) || "").toUpperCase();
  if (iata && KNOWN_AIRPORTS[iata]) return KNOWN_AIRPORTS[iata];

  const q = label.trim().toLowerCase();
  if (!q) return null;

  const pop = POPULAR_AIRPORTS.find(
    (p) =>
      p.label.toLowerCase() === q ||
      p.query.toLowerCase() === q ||
      p.searchQuery.toLowerCase() === q ||
      p.iata?.toLowerCase() === q,
  );
  if (pop?.skyId && pop.entityId) {
    return { skyId: pop.skyId, entityId: pop.entityId };
  }

  return null;
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

/** Live airport suggest via Air Scraper v1 searchAirport. */
export async function suggestSkyScrapperAirports(
  query: string,
  limit = 8,
  locale = "en-US",
): Promise<SearchSuggestion[]> {
  if (!rapidApiConfigured() || !canUseAirportSuggestApi()) return [];

  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL(`https://${rapidApiHost()}/api/v1/flights/searchAirport`);
  url.searchParams.set("query", trimmed);
  url.searchParams.set("locale", locale);

  try {
    const res = await rapidApiFetch(url.toString(), { timeoutMs: 8000, retries: 0 });
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
  if (!cacheKey) return null;

  const cached = getCachedAirport(cacheKey);
  if (cached) return cached;

  if (rapidApiConfigured() && canUseAirportSuggestApi()) {
    const q = iataCode.trim() || keyword.trim();
    if (q) {
      const suggestions = await suggestSkyScrapperAirports(q, 4);
      const iata = iataCode.trim().toUpperCase();
      const match =
        (iata && suggestions.find((s) => s.iata?.toUpperCase() === iata)) ||
        suggestions[0];
      if (match?.skyId && match?.entityId) {
        const ref = { skyId: match.skyId, entityId: match.entityId };
        setCachedAirport(cacheKey, ref);
        return ref;
      }
    }
  }

  const local = findKnownAirport(keyword, iataCode);
  if (local) {
    setCachedAirport(cacheKey, local);
    return local;
  }

  return null;
}
