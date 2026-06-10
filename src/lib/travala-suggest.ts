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
  query: string;
  slug?: string;
  iata?: string;
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

function cityToSuggestion(item: TravalaCityItem): SearchSuggestion | null {
  if (!item.name || !item.id) return null;
  const type = primaryType(item);
  const label = stripHtml(item.accent_name || item.name);
  const iata = item.iata_airport_metro_code || undefined;

  let subtitle: string | undefined;
  if (AIRPORT_TYPES.has(type) && iata) {
    subtitle = iata;
  } else if (type === "neighborhood" && item.name.includes(",")) {
    const parts = item.name.split(",").map((p) => p.trim());
    subtitle = parts.slice(1).join(", ") || undefined;
  }

  return {
    id: `loc-${item.id}`,
    label,
    subtitle,
    kind: kindFromType(type),
    query: stripHtml(item.name),
    slug: item.city_slug || item.slug || undefined,
    iata,
  };
}

function propertyToSuggestion(item: TravalaPropertyItem): SearchSuggestion | null {
  if (!item.name || !item.code) return null;
  const label = stripHtml(item.accent_name || item.name);
  const subtitle = [item.city_name, item.country_name].filter(Boolean).join(", ") || undefined;

  return {
    id: `hotel-${item.code}`,
    label,
    subtitle,
    kind: "hotel",
    query: stripHtml(item.name),
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
  neighborhood: 1,
  hotel: 2,
  landmark: 3,
  airport: 4,
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
  if (searchType === "car-rental" || searchType === "activities") {
    return new Set<SuggestionKind>(["city", "neighborhood", "airport", "landmark", "region", "country"]);
  }
  return null;
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
    limit: String(Math.min(limit * 2, 20)),
    enable_rth_search: "true",
    enable_typeahead: "true",
    typeahead_version: "V2",
  });

  const res = await fetch(`https://api.travala.com/suggestion/v2/autocomplete?${params}`, {
    headers: {
      Accept: "application/json",
      platformVersion: "web",
      "User-Agent": "Mozilla/5.0 (compatible; TravalaClone/1.0)",
    },
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

  const locations = (json.data.cities || [])
    .map(cityToSuggestion)
    .filter((item): item is SearchSuggestion => Boolean(item))
    .filter((item) => !allowed || allowed.has(item.kind));

  const hotels = includeHotels
    ? (json.data.properties || [])
        .map(propertyToSuggestion)
        .filter((item): item is SearchSuggestion => Boolean(item))
    : [];

  const merged = [...locations, ...hotels]
    .sort((a, b) => priority[a.kind] - priority[b.kind])
    .filter((item, index, arr) => arr.findIndex((x) => x.label === item.label) === index)
    .slice(0, limit);

  return merged;
}
