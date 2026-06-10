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
import { useTranslations } from "@/i18n/useTranslations";

function SuggestionIcon({ kind }: { kind: SuggestionKind }) {
  const className = "h-4 w-4 flex-shrink-0 text-[#2D83C2]";
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
  const { messages: m, fmt } = useTranslations();
  const kindLabels = m.suggestionKinds;

  if (!query.trim() && suggestions.length === 0) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full z-[70] mt-1 max-h-[min(16rem,45vh)] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
      role="listbox"
      aria-label={m.common.search}
    >
      {!query.trim() && suggestions.length > 0 && (
        <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {m.search.topInternationalCities}
        </p>
      )}

      {loading && suggestions.length === 0 && query.trim().length >= 2 && (
        <p className="px-4 py-3 text-sm text-gray-500">{m.common.searching}</p>
      )}

      {!loading && suggestions.length === 0 && query.trim().length >= 2 && (
        <p className="px-4 py-3 text-sm text-gray-500">{fmt(m.common.noResults, { query })}</p>
      )}

      {suggestions.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={activeIndex === index}
          onMouseEnter={() => onHover(index)}
          onClick={() => onSelect(item)}
          className={`flex w-full min-h-[48px] items-start gap-3 px-3 py-2.5 text-left transition sm:px-4 ${
            activeIndex === index ? "bg-[#eef5fc]" : "hover:bg-gray-50"
          }`}
        >
          <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#eef5fc]">
            <SuggestionIcon kind={item.kind} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-gray-900">{item.label}</span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
              <span>{kindLabels[item.kind as keyof typeof kindLabels]}</span>
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
