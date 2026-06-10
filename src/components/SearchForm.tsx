"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Users } from "lucide-react";
import SearchSuggestions from "./SearchSuggestions";
import type { SearchSuggestion } from "@/lib/travala-suggest";

const TABS = [
  { key: "stays", label: "Stays" },
  { key: "flights", label: "Flights" },
  { key: "car-rental", label: "Car Rental", badge: "NEW!" },
  { key: "activities", label: "Activities" },
] as const;

const PLACEHOLDERS: Record<string, string> = {
  stays: "Search for Places or Properties",
  flights: "From airport or city",
  "car-rental": "Pick-up city or airport",
  activities: "City or destination",
};

export default function SearchForm({
  defaultType = "stays",
  defaultQuery = "",
  compact = false,
}: {
  defaultType?: string;
  defaultQuery?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [type, setType] = useState(defaultType);
  const [query, setQuery] = useState(defaultQuery);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(
    async (value: string, searchType: string) => {
      const trimmed = value.trim();
      if (trimmed.length < 1) {
        setSuggestions([]);
        setSuggestLoading(false);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setSuggestLoading(true);

      try {
        const params = new URLSearchParams({ q: trimmed, type: searchType, limit: "12" });
        const res = await fetch(`/api/search/suggest?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error("suggest failed");
        const data = (await res.json()) as { suggestions?: SearchSuggestion[] };
        setSuggestions(data.suggestions || []);
        setActiveIndex(-1);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setSuggestLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!suggestOpen) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(query, type);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, type, suggestOpen, fetchSuggestions]);

  useEffect(() => {
    setSuggestions([]);
    setActiveIndex(-1);
  }, [type]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  const navigateToSearch = (searchQuery: string) => {
    const params = new URLSearchParams({ type });
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", String(guests));
    setSuggestOpen(false);
    router.push(`/search?${params.toString()}`);
  };

  const selectSuggestion = (item: SearchSuggestion) => {
    setQuery(item.query);
    navigateToSearch(item.query);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDates = type === "stays" || type === "car-rental";

  return (
    <form
      onSubmit={handleSearch}
      className="w-full min-w-0 rounded-2xl bg-white p-2 shadow-xl sm:p-2.5"
    >
      <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto border-b border-gray-100 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setType(tab.key)}
            className={`relative flex-shrink-0 snap-start px-3 py-2.5 text-xs font-semibold transition sm:px-5 sm:py-3 sm:text-sm ${
              type === tab.key
                ? "text-[#2577be] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2577be]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {"badge" in tab && tab.badge && (
              <span className="mr-1 rounded bg-[#2dd4bf] px-1 py-0.5 text-[8px] font-bold text-[#1e2e5e] sm:text-[9px]">
                {tab.badge}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className={`flex min-w-0 flex-col gap-2 p-2 sm:p-3 ${
          compact ? "md:flex-row md:flex-wrap md:items-center lg:flex-nowrap" : "md:flex-row md:items-center"
        }`}
      >
        <div ref={containerRef} className="relative min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 sm:px-4 sm:py-3">
            <Search size={18} className="flex-shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestOpen(true);
              }}
              onFocus={() => setSuggestOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[type] || "Where to?"}
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={suggestOpen && (suggestions.length > 0 || suggestLoading)}
              className="min-w-0 w-full text-sm outline-none placeholder:text-gray-400 sm:placeholder:text-gray-500"
            />
          </div>

          {suggestOpen && (
            <SearchSuggestions
              suggestions={suggestions}
              loading={suggestLoading}
              query={query}
              activeIndex={activeIndex}
              onSelect={selectSuggestion}
              onHover={setActiveIndex}
            />
          )}
        </div>

        {showDates && (
          <div className="grid min-w-0 grid-cols-2 gap-2 md:contents">
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="min-w-0 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3 md:w-36 lg:w-40"
              title="Check-in"
            />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="min-w-0 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3 md:w-36 lg:w-40"
              title="Check-out"
            />
          </div>
        )}

        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 sm:px-4 sm:py-3 md:w-28 lg:w-32">
          <Users size={16} className="flex-shrink-0 text-gray-400" />
          <input
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            className="min-w-0 w-full text-sm outline-none"
            aria-label="Guests"
          />
        </div>

        <button
          type="submit"
          className="flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2577be] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1e2e5e] sm:py-3.5 md:w-auto md:px-8"
        >
          <Search size={16} />
          Search
        </button>
      </div>
    </form>
  );
}
