import type { SearchSuggestion } from "@/lib/travala-suggest";

/** Instant city suggestions for hotel/stays search */
export const POPULAR_CITIES: SearchSuggestion[] = [
  { id: "city-lon", label: "London", subtitle: "United Kingdom", kind: "city", query: "London", searchQuery: "London" },
  { id: "city-par", label: "Paris", subtitle: "France", kind: "city", query: "Paris", searchQuery: "Paris" },
  { id: "city-ber", label: "Berlin", subtitle: "Germany", kind: "city", query: "Berlin", searchQuery: "Berlin" },
  { id: "city-muc", label: "Munich", subtitle: "Germany", kind: "city", query: "Munich", searchQuery: "Munich" },
  { id: "city-ams", label: "Amsterdam", subtitle: "Netherlands", kind: "city", query: "Amsterdam", searchQuery: "Amsterdam" },
  { id: "city-bcn", label: "Barcelona", subtitle: "Spain", kind: "city", query: "Barcelona", searchQuery: "Barcelona" },
  { id: "city-rom", label: "Rome", subtitle: "Italy", kind: "city", query: "Rome", searchQuery: "Rome" },
  { id: "city-dxb", label: "Dubai", subtitle: "UAE", kind: "city", query: "Dubai", searchQuery: "Dubai" },
  { id: "city-nyc", label: "New York", subtitle: "USA", kind: "city", query: "New York", searchQuery: "New York" },
  { id: "city-bkk", label: "Bangkok", subtitle: "Thailand", kind: "city", query: "Bangkok", searchQuery: "Bangkok" },
  { id: "city-vie", label: "Vienna", subtitle: "Austria", kind: "city", query: "Vienna", searchQuery: "Vienna" },
  { id: "city-prg", label: "Prague", subtitle: "Czech Republic", kind: "city", query: "Prague", searchQuery: "Prague" },
  { id: "city-lis", label: "Lisbon", subtitle: "Portugal", kind: "city", query: "Lisbon", searchQuery: "Lisbon" },
  { id: "city-mad", label: "Madrid", subtitle: "Spain", kind: "city", query: "Madrid", searchQuery: "Madrid" },
  { id: "city-zrh", label: "Zurich", subtitle: "Switzerland", kind: "city", query: "Zurich", searchQuery: "Zurich" },
  { id: "city-ist", label: "Istanbul", subtitle: "Turkey", kind: "city", query: "Istanbul", searchQuery: "Istanbul" },
];

export function filterPopularCities(query: string, limit = 12): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR_CITIES.slice(0, limit);
  return POPULAR_CITIES.filter((item) => {
    const hay = `${item.label} ${item.subtitle || ""} ${item.searchQuery}`.toLowerCase();
    return hay.includes(q);
  }).slice(0, limit);
}
