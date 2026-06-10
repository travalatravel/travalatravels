"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, ChevronDown, MapPin, X } from "lucide-react";
import type { SearchSuggestion } from "@/lib/travala-suggest";
import { useTranslations } from "@/i18n/useTranslations";

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-[#2D83C2]">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function MobileSearchOverlay({
  open,
  title,
  placeholder,
  query,
  onQueryChange,
  suggestions,
  loading,
  onSelect,
  onClose,
  showAllAirportsBadge = false,
}: {
  open: boolean;
  title: string;
  placeholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  suggestions: SearchSuggestion[];
  loading: boolean;
  onSelect: (item: SearchSuggestion) => void;
  onClose: () => void;
  showAllAirportsBadge?: boolean;
}) {
  const { messages: m, fmt } = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-search-overlay", "");
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-search-overlay");
      window.clearTimeout(t);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white lg:hidden">
      <div className="shrink-0 bg-[#250834] px-4 pb-4 pt-3 text-white">
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
            aria-label={m.common.back}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="flex-1 text-center text-base font-semibold">{title}</h2>
          <span className="w-10" aria-hidden />
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-[#1a1a1a]">
          <MapPin size={20} className="shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-gray-400"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
              aria-label={m.search.mobileSearch.clearSearch}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && suggestions.length === 0 && query.trim().length >= 1 && (
          <p className="px-4 py-6 text-sm text-gray-500">{m.common.searching}</p>
        )}

        {!loading && suggestions.length === 0 && query.trim().length >= 1 && (
          <p className="px-4 py-6 text-sm text-gray-500">{fmt(m.common.noResults, { query })}</p>
        )}

        {suggestions.map((item) => {
          const showBadge = showAllAirportsBadge && item.kind === "city";
          const code = item.iata ? ` ${item.iata}` : "";
          const line = item.subtitle ? `${item.label}, ${item.subtitle}${code}` : `${item.label}${code}`;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-4 text-left hover:bg-gray-50"
            >
              <MapPin size={18} className="shrink-0 text-[#2D83C2]" />
              <span className="min-w-0 flex-1 text-sm text-gray-800">
                <HighlightMatch text={line} query={query} />
              </span>
              {showBadge && (
                <span className="flex shrink-0 items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-600">
                  {m.search.mobileSearch.allAirports}
                  <ChevronDown size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
