import type { SearchSuggestion } from "@/lib/travala-suggest";

/** Instant airport/city suggestions — no API call required */
export const POPULAR_AIRPORTS: SearchSuggestion[] = [
  { id: "pop-lon", label: "London", subtitle: "United Kingdom", kind: "city", query: "London", searchQuery: "London", iata: "LON", skyId: "LOND", entityId: "27544008" },
  { id: "pop-par", label: "Paris", subtitle: "France", kind: "city", query: "Paris", searchQuery: "Paris", iata: "PAR", skyId: "PARI", entityId: "27539733" },
  { id: "pop-nyc", label: "New York", subtitle: "United States", kind: "city", query: "New York", searchQuery: "New York", iata: "NYC", skyId: "NYCA", entityId: "27537542" },
  { id: "pop-dxb", label: "Dubai", subtitle: "United Arab Emirates", kind: "city", query: "Dubai", searchQuery: "Dubai", iata: "DXB", skyId: "DXBA", entityId: "27540851" },
  { id: "pop-bkk", label: "Bangkok", subtitle: "Thailand", kind: "city", query: "Bangkok", searchQuery: "Bangkok", iata: "BKK", skyId: "BKKT", entityId: "27536671" },
  { id: "pop-sin", label: "Singapore", subtitle: "Singapore", kind: "city", query: "Singapore", searchQuery: "Singapore", iata: "SIN", skyId: "SINS", entityId: "27546111" },
  { id: "pop-tyo", label: "Tokyo", subtitle: "Japan", kind: "city", query: "Tokyo", searchQuery: "Tokyo", iata: "TYO", skyId: "TYOA", entityId: "27542089" },
  { id: "pop-lax", label: "Los Angeles", subtitle: "United States", kind: "city", query: "Los Angeles", searchQuery: "Los Angeles", iata: "LAX", skyId: "LAXA", entityId: "27536637" },
  { id: "pop-fra", label: "Frankfurt", subtitle: "Germany", kind: "city", query: "Frankfurt", searchQuery: "Frankfurt", iata: "FRA", skyId: "FRAA", entityId: "27534206" },
  { id: "pop-ams", label: "Amsterdam", subtitle: "Netherlands", kind: "city", query: "Amsterdam", searchQuery: "Amsterdam", iata: "AMS", skyId: "AMSA", entityId: "27534067" },
  { id: "pop-bcn", label: "Barcelona", subtitle: "Spain", kind: "city", query: "Barcelona", searchQuery: "Barcelona", iata: "BCN", skyId: "BCNA", entityId: "27548283" },
  { id: "pop-syd", label: "Sydney", subtitle: "Australia", kind: "city", query: "Sydney", searchQuery: "Sydney", iata: "SYD", skyId: "SYDA", entityId: "27546111" },
  { id: "pop-ber", label: "Berlin", subtitle: "Germany", kind: "city", query: "Berlin", searchQuery: "Berlin", iata: "BER", skyId: "BER", entityId: "95673383" },
  { id: "pop-muc", label: "Munich", subtitle: "Germany", kind: "city", query: "Munich", searchQuery: "Munich", iata: "MUC", skyId: "MUC", entityId: "95673491" },
  { id: "pop-rom", label: "Rome", subtitle: "Italy", kind: "city", query: "Rome", searchQuery: "Rome", iata: "ROM", skyId: "ROMA", entityId: "27539793" },
  { id: "pop-mad", label: "Madrid", subtitle: "Spain", kind: "city", query: "Madrid", searchQuery: "Madrid", iata: "MAD", skyId: "MADR", entityId: "27544856" },
  { id: "pop-ist", label: "Istanbul", subtitle: "Turkey", kind: "city", query: "Istanbul", searchQuery: "Istanbul", iata: "IST", skyId: "ISTA", entityId: "27536470" },
  { id: "pop-hkg", label: "Hong Kong", subtitle: "Hong Kong", kind: "city", query: "Hong Kong", searchQuery: "Hong Kong", iata: "HKG", skyId: "HKGA", entityId: "27536566" },
];

export function filterPopularAirports(query: string, limit = 12): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR_AIRPORTS.slice(0, limit);
  return POPULAR_AIRPORTS.filter((item) => {
    const hay = `${item.label} ${item.subtitle || ""} ${item.iata || ""} ${item.searchQuery}`.toLowerCase();
    return hay.includes(q);
  }).slice(0, limit);
}
