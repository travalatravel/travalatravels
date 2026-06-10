"use client";

import {
  Building2,
  Globe,
  Landmark,
  MapPin,
  Plane,
  Train,
} from "lucide-react";
import type { SearchSuggestion, SuggestionKind } from "@/lib/travala-suggest";

const KIND_LABELS: Record<SuggestionKind, string> = {
  airport: "Airport",
  city: "City",
  hotel: "Hotel",
  country: "Country",
  neighborhood: "Neighborhood",
  landmark: "Landmark",
  region: "Region",
  station: "Station",
};

function SuggestionIcon({ kind }: { kind: SuggestionKind }) {
  const className = "h-4 w-4 flex-shrink-0 text-[#2577be]";
  switch (kind) {
    case "airport":
      return <Plane className={className} aria-hidden />;
    case "hotel":
      return <Building2 className={className} aria-hidden />;
    case "country":
    case "region":
      return <Globe className={className} aria-hidden />;
    case "landmark":
      return <Landmark className={className} aria-hidden />;
    case "station":
      return <Train className={className} aria-hidden />;
    default:
      return <MapPin className={className} aria-hidden />;
  }
}

export default function SearchSuggestions({
  suggestions,
  loading,
  query,
  activeIndex,
  onSelect,
  onHover,
}: {
  suggestions: SearchSuggestion[];
  loading: boolean;
  query: string;
  activeIndex: number;
  onSelect: (item: SearchSuggestion) => void;
  onHover: (index: number) => void;
}) {
  if (!query.trim()) return null;

  return (
    <div
      className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-[min(22rem,60vh)] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-2xl"
      role="listbox"
      aria-label="Search suggestions"
    >
      {loading && suggestions.length === 0 && (
        <p className="px-4 py-3 text-sm text-gray-500">Searching...</p>
      )}

      {!loading && suggestions.length === 0 && query.trim().length >= 1 && (
        <p className="px-4 py-3 text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
      )}

      {suggestions.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={activeIndex === index}
          onMouseEnter={() => onHover(index)}
          onClick={() => onSelect(item)}
          className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition sm:px-4 ${
            activeIndex === index ? "bg-[#eef5fc]" : "hover:bg-gray-50"
          }`}
        >
          <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#eef5fc]">
            <SuggestionIcon kind={item.kind} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-gray-900">{item.label}</span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
              <span>{KIND_LABELS[item.kind]}</span>
              {item.subtitle && (
                <>
                  <span aria-hidden>·</span>
                  <span className="truncate">{item.subtitle}</span>
                </>
              )}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
