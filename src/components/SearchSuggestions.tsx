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
  mobileSheet = false,
}: {
  suggestions: SearchSuggestion[];
  loading: boolean;
  query: string;
  activeIndex: number;
  onSelect: (item: SearchSuggestion) => void;
  onHover: (index: number) => void;
  mobileSheet?: boolean;
}) {
  const { messages: m, fmt } = useTranslations();
  const kindLabels = m.suggestionKinds;

  if (!query.trim()) return null;

  const listClass = mobileSheet
    ? "fixed inset-x-0 bottom-0 z-[60] max-h-[min(24rem,55vh)] overflow-y-auto rounded-t-2xl border border-gray-200 bg-white py-1 shadow-2xl sm:absolute sm:inset-x-0 sm:bottom-auto sm:top-[calc(100%+0.35rem)] sm:z-50 sm:max-h-[min(22rem,60vh)] sm:rounded-xl"
    : "absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-[min(22rem,60vh)] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-2xl";

  return (
    <>
      {mobileSheet && (suggestions.length > 0 || loading) && (
        <div className="fixed inset-0 z-[55] bg-black/25 sm:hidden" aria-hidden />
      )}
      <div
        className={listClass}
        role="listbox"
        aria-label="Search suggestions"
      >
      {loading && suggestions.length === 0 && (
        <p className="px-4 py-3 text-sm text-gray-500">{m.common.searching}</p>
      )}

      {!loading && suggestions.length === 0 && query.trim().length >= 1 && (
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
          className={`flex w-full min-h-[52px] items-start gap-3 px-3 py-3 text-left transition sm:min-h-0 sm:px-4 sm:py-2.5 ${
            activeIndex === index ? "bg-[#eef5fc]" : "hover:bg-gray-50"
          }`}
        >
          <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#eef5fc]">
            <SuggestionIcon kind={item.kind} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-medium text-gray-900 sm:text-sm">{item.label}</span>
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
    </>
  );
}
