import { travalaApiHeaders } from "./travala-headers";
import { normalizeSearchQuery } from "./search-query";

export type SuggestionKind =
  | "airport"
  | "city"
  | "hotel"
  | "country"
  | "neighborhood"
  | "landmark"
  | "region"
  | "station";

export type SearchSuggestion = {
  id: string;
  label: string;
  subtitle?: string;
  kind: SuggestionKind;
  /** Full Travala label — shown in the input after selection */
  query: string;
  /** Short term passed to /search (city name, hotel name, etc.) */
  searchQuery: string;
  slug?: string;
  iata?: string;
  /** Sky Scrapper flight place IDs — set when autocomplete uses searchAirport */
  skyId?: string;
  entityId?: string;
};

type TravalaCityItem = {
  type?: string;
  types?: string[];
  name?: string;
  accent_name?: string;
  id?: string | number;
  slug?: string | null;
  city_slug?: string | null;
  country_slug?: string | null;
  iata_airport_metro_code?: string | null;
};

type TravalaPropertyItem = {
  code?: string;
  name?: string;
  accent_name?: string;
  slug?: string | null;
  category?: string;
  city_name?: string | null;
  country_name?: string | null;
};

const AIRPORT_TYPES = new Set(["airport", "airport_metro_code"]);
const CITY_TYPES = new Set(["city", "multi_city_vicinity"]);
const COUNTRY_TYPES = new Set(["country", "continent"]);
const REGION_TYPES = new Set(["multi_region", "province_state", "high_level_region"]);
const STATION_TYPES = new Set(["train_station", "metro_station", "bus_station"]);
const LANDMARK_TYPES = new Set(["point_of_interest"]);

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

function primaryType(item: TravalaCityItem): string {
  return (item.type || item.types?.[0] || "").toLowerCase();
}

function kindFromType(type: string): SuggestionKind {
  if (AIRPORT_TYPES.has(type)) return "airport";
  if (CITY_TYPES.has(type)) return "city";
  if (COUNTRY_TYPES.has(type)) return "country";
  if (REGION_TYPES.has(type)) return "region";
  if (STATION_TYPES.has(type)) return "station";
  if (LANDMARK_TYPES.has(type)) return "landmark";
  if (type === "neighborhood") return "neighborhood";
  return "city";
}

function searchQueryForLocation(name: string, kind: SuggestionKind): string {
  const clean = stripHtml(name);
  const parts = clean.split(",").map((p) => p.trim()).filter(Boolean);

  if (kind === "neighborhood" && parts.length >= 2) {
    return normalizeSearchQuery(parts[1]);
  }

  if (kind === "airport") {
    return normalizeSearchQuery(parts[0] || clean);
  }

  return normalizeSearchQuery(clean);
}

function cityToSuggestion(item: TravalaCityItem): SearchSuggestion | null {
  if (!item.name || !item.id) return null;
  const type = primaryType(item);
  const kind = kindFromType(type);
  const label = stripHtml(item.accent_name || item.name);
  const query = stripHtml(item.name);
  const searchQuery = searchQueryForLocation(query, kind);
  const iata = item.iata_airport_metro_code || undefined;

  let subtitle: string | undefined;
  if (AIRPORT_TYPES.has(type) && iata) {
    subtitle = iata;
  } else if (partsAfterCity(query)) {
    subtitle = partsAfterCity(query);
  }

  return {
    id: `loc-${item.id}`,
    label,
    subtitle,
    kind,
    query,
    searchQuery,
    slug: item.city_slug || item.slug || undefined,
    iata,
  };
}

function partsAfterCity(name: string): string | undefined {
  const parts = name.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return undefined;
  return parts.slice(1).join(", ");
}

function propertyToSuggestion(item: TravalaPropertyItem): SearchSuggestion | null {
  if (!item.name || !item.code) return null;
  const label = stripHtml(item.accent_name || item.name);
  const query = stripHtml(item.name);
  const city = item.city_name?.trim();
  const subtitle = [city, item.country_name].filter(Boolean).join(", ") || undefined;

  return {
    id: `hotel-${item.code}`,
    label,
    subtitle,
    kind: "hotel",
    query,
    searchQuery: city || query,
    slug: item.slug || undefined,
  };
}

const FLIGHT_PRIORITY: Record<SuggestionKind, number> = {
  airport: 0,
  city: 1,
  station: 2,
  neighborhood: 3,
  landmark: 4,
  region: 5,
  country: 6,
  hotel: 7,
};

const STAYS_PRIORITY: Record<SuggestionKind, number> = {
  city: 0,
  hotel: 1,
  airport: 2,
  neighborhood: 3,
  landmark: 4,
  region: 5,
  country: 6,
  station: 7,
};

const LOCATION_PRIORITY: Record<SuggestionKind, number> = {
  city: 0,
  neighborhood: 1,
  airport: 2,
  landmark: 3,
  region: 4,
  country: 5,
  station: 6,
  hotel: 7,
};

function priorityForType(searchType: string): Record<SuggestionKind, number> {
  if (searchType === "flights") return FLIGHT_PRIORITY;
  if (searchType === "stays") return STAYS_PRIORITY;
  return LOCATION_PRIORITY;
}

function allowedKinds(searchType: string): Set<SuggestionKind> | null {
  if (searchType === "flights") {
    return new Set<SuggestionKind>(["airport", "city", "station"]);
  }
  if (searchType === "stays") {
    return new Set<SuggestionKind>(["city", "hotel", "airport"]);
  }
  if (searchType === "car-rental" || searchType === "activities") {
    return new Set<SuggestionKind>(["city", "airport", "landmark", "country"]);
  }
  return null;
}

function exactMatchBoost(item: SearchSuggestion, q: string): number {
  const needle = q.trim().toLowerCase();
  if (!needle) return 0;
  if (item.searchQuery.toLowerCase() === needle) return -10;
  if (item.searchQuery.toLowerCase().startsWith(needle)) return -5;
  if (item.label.toLowerCase().includes(needle)) return -2;
  return 0;
}

function dedupeSuggestions(items: SearchSuggestion[], searchType: string): SearchSuggestion[] {
  const seen = new Map<string, SearchSuggestion>();
  const priority = priorityForType(searchType);

  for (const item of items) {
    const key = item.searchQuery.toLowerCase();
    const existing = seen.get(key);

    if (!existing || priority[item.kind] < priority[existing.kind]) {
      seen.set(key, item);
      continue;
    }

    if (priority[item.kind] === priority[existing.kind] && item.kind === "airport") {
      const preferAll = /all airports/i.test(item.label);
      const existingAll = /all airports/i.test(existing.label);
      if (preferAll && !existingAll) seen.set(key, item);
    }
  }

  return [...seen.values()];
}

export async function fetchTravalaSuggestions(
  q: string,
  searchType: string,
  limit = 12,
): Promise<SearchSuggestion[]> {
  const trimmed = q.trim();
  if (trimmed.length < 1) return [];

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(Math.min(limit * 3, 24)),
    enable_rth_search: "true",
    enable_typeahead: "true",
    typeahead_version: "V2",
  });

  const res = await fetch(`https://api.travala.com/suggestion/v2/autocomplete?${params}`, {
    headers: travalaApiHeaders(),
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  const json = (await res.json()) as {
    success?: boolean;
    data?: {
      cities?: TravalaCityItem[];
      properties?: TravalaPropertyItem[];
    };
  };

  if (!json.success || !json.data) return [];

  const allowed = allowedKinds(searchType);
  const priority = priorityForType(searchType);
  const includeHotels = searchType === "stays";
  const maxResults = searchType === "stays" ? Math.min(limit, 8) : limit;

  const locations = (json.data.cities || [])
    .map(cityToSuggestion)
    .filter((item): item is SearchSuggestion => Boolean(item))
    .filter((item) => !allowed || allowed.has(item.kind));

  const hotels = includeHotels
    ? (json.data.properties || [])
        .map(propertyToSuggestion)
        .filter((item): item is SearchSuggestion => Boolean(item))
    : [];

  const merged = dedupeSuggestions([...locations, ...hotels], searchType)
    .sort(
      (a, b) =>
        exactMatchBoost(a, trimmed) - exactMatchBoost(b, trimmed) ||
        priority[a.kind] - priority[b.kind] ||
        a.label.localeCompare(b.label),
    )
    .slice(0, maxResults);

  return merged;
}
