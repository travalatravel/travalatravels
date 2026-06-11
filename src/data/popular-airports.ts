import type { SearchSuggestion } from "@/lib/travala-suggest";

/** Instant airport/city suggestions — skyId/entityId synced with Air Scraper v1 */
export const POPULAR_AIRPORTS: SearchSuggestion[] = [
  { id: "pop-fra", label: "Frankfurt", subtitle: "Germany", kind: "city", query: "Frankfurt", searchQuery: "Frankfurt", iata: "FRA", skyId: "FRAN", entityId: "27541706" },
  { id: "pop-ber", label: "Berlin", subtitle: "Germany", kind: "city", query: "Berlin", searchQuery: "Berlin", iata: "BER", skyId: "BER", entityId: "95673383" },
  { id: "pop-muc", label: "Munich", subtitle: "Germany", kind: "city", query: "Munich", searchQuery: "Munich", iata: "MUC", skyId: "MUC", entityId: "95673491" },
  { id: "pop-ham", label: "Hamburg", subtitle: "Germany", kind: "city", query: "Hamburg", searchQuery: "Hamburg", iata: "HAM", skyId: "HAMB", entityId: "27536295" },
  { id: "pop-dus", label: "Düsseldorf", subtitle: "Germany", kind: "city", query: "Düsseldorf", searchQuery: "Düsseldorf", iata: "DUS", skyId: "DUS", entityId: "95673545" },
  { id: "pop-cgn", label: "Cologne", subtitle: "Germany", kind: "city", query: "Cologne", searchQuery: "Cologne", iata: "CGN", skyId: "CGN", entityId: "95673544" },
  { id: "pop-str", label: "Stuttgart", subtitle: "Germany", kind: "city", query: "Stuttgart", searchQuery: "Stuttgart", iata: "STR", skyId: "STR", entityId: "95673677" },
  { id: "pop-vie", label: "Vienna", subtitle: "Austria", kind: "city", query: "Vienna", searchQuery: "Vienna", iata: "VIE", skyId: "VIE", entityId: "95673444" },
  { id: "pop-zrh", label: "Zurich", subtitle: "Switzerland", kind: "city", query: "Zurich", searchQuery: "Zurich", iata: "ZRH", skyId: "ZRH", entityId: "95673856" },
  { id: "pop-ams", label: "Amsterdam", subtitle: "Netherlands", kind: "city", query: "Amsterdam", searchQuery: "Amsterdam", iata: "AMS", skyId: "AMS", entityId: "95565044" },
  { id: "pop-par", label: "Paris", subtitle: "France", kind: "city", query: "Paris", searchQuery: "Paris", iata: "PAR", skyId: "PARI", entityId: "27539733" },
  { id: "pop-lon", label: "London", subtitle: "United Kingdom", kind: "city", query: "London", searchQuery: "London", iata: "LON", skyId: "LOND", entityId: "27544008" },
  { id: "pop-bcn", label: "Barcelona", subtitle: "Spain", kind: "city", query: "Barcelona", searchQuery: "Barcelona", iata: "BCN", skyId: "BCN", entityId: "95565085" },
  { id: "pop-mad", label: "Madrid", subtitle: "Spain", kind: "city", query: "Madrid", searchQuery: "Madrid", iata: "MAD", skyId: "MAD", entityId: "95565077" },
  { id: "pop-rom", label: "Rome", subtitle: "Italy", kind: "city", query: "Rome", searchQuery: "Rome", iata: "ROM", skyId: "ROME", entityId: "27539793" },
  { id: "pop-ist", label: "Istanbul", subtitle: "Turkey", kind: "city", query: "Istanbul", searchQuery: "Istanbul", iata: "IST", skyId: "ISTA", entityId: "27542903" },
  { id: "pop-dxb", label: "Dubai", subtitle: "United Arab Emirates", kind: "city", query: "Dubai", searchQuery: "Dubai", iata: "DXB", skyId: "DXBA", entityId: "27540839" },
  { id: "pop-nyc", label: "New York", subtitle: "United States", kind: "city", query: "New York", searchQuery: "New York", iata: "NYC", skyId: "NYCA", entityId: "27537542" },
  { id: "pop-bkk", label: "Bangkok", subtitle: "Thailand", kind: "city", query: "Bangkok", searchQuery: "Bangkok", iata: "BKK", skyId: "BKKT", entityId: "27536671" },
  { id: "pop-sin", label: "Singapore", subtitle: "Singapore", kind: "city", query: "Singapore", searchQuery: "Singapore", iata: "SIN", skyId: "SINS", entityId: "27546111" },
  { id: "pop-tyo", label: "Tokyo", subtitle: "Japan", kind: "city", query: "Tokyo", searchQuery: "Tokyo", iata: "TYO", skyId: "TYOA", entityId: "27542089" },
  { id: "pop-lax", label: "Los Angeles", subtitle: "United States", kind: "city", query: "Los Angeles", searchQuery: "Los Angeles", iata: "LAX", skyId: "LAXA", entityId: "27536211" },
  { id: "pop-syd", label: "Sydney", subtitle: "Australia", kind: "city", query: "Sydney", searchQuery: "Sydney", iata: "SYD", skyId: "SYDA", entityId: "27547097" },
  { id: "pop-hkg", label: "Hong Kong", subtitle: "Hong Kong", kind: "city", query: "Hong Kong", searchQuery: "Hong Kong", iata: "HKG", skyId: "HKG", entityId: "128668132" },
];

export function filterPopularAirports(query: string, limit = 12): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR_AIRPORTS.slice(0, limit);
  return POPULAR_AIRPORTS.filter((item) => {
    const hay = `${item.label} ${item.subtitle || ""} ${item.iata || ""} ${item.searchQuery}`.toLowerCase();
    return hay.includes(q);
  }).slice(0, limit);
}
