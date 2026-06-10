"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, Car, MapPin, Plane } from "lucide-react";
import SearchSuggestions from "./SearchSuggestions";
import type { SearchSuggestion } from "@/lib/travala-suggest";
import { ASSETS } from "@/data/site-data";
import { defaultStayDates } from "@/lib/travala-price";

const TABS = [
  { key: "stays", label: "Stays", icon: Building2 },
  { key: "flights", label: "Flights", icon: Plane },
  { key: "car-rental", label: "Car Rental", badge: "NEW!" as const, icon: Car },
  { key: "activities", label: "Activities", icon: MapPin },
] as const;

const PLACEHOLDERS: Record<string, string> = {
  stays: "Search for Places or Properties",
  flights: "From airport or city",
  "car-rental": "Pick-up city or airport",
  activities: "City or destination",
};

function formatDisplayDate(iso: string) {
  if (!iso) return { full: "Select date", day: "" };
  const d = new Date(`${iso}T12:00:00`);
  return {
    full: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    day: d.toLocaleDateString("en-GB", { weekday: "long" }),
  };
}

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
  const defaults = defaultStayDates();
  const [type, setType] = useState(defaultType);
  const [query, setQuery] = useState(defaultQuery);
  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [guests, setGuests] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [roomOpen, setRoomOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const showDates = type === "stays" || type === "car-rental";
  const showRooms = type === "stays";
  const isHero = !compact;

  const fetchSuggestions = useCallback(async (value: string, searchType: string) => {
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
  }, []);

  useEffect(() => {
    if (!suggestOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void fetchSuggestions(query, type), 200);
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
      if (!containerRef.current?.contains(event.target as Node)) setSuggestOpen(false);
      if (!roomRef.current?.contains(event.target as Node)) setRoomOpen(false);
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
    params.set("guests", String(guests + children));
    if (showRooms) params.set("rooms", String(rooms));
    setSuggestOpen(false);
    router.push(`/search?${params.toString()}`);
  };

  const selectSuggestion = (item: SearchSuggestion) => {
    setQuery(item.query);
    navigateToSearch(item.query);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
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

  const checkInFmt = formatDisplayDate(checkIn);
  const checkOutFmt = formatDisplayDate(checkOut);

  const tabRow = (
    <div
      role="tablist"
      aria-label="searchType"
      className={`flex ${isHero ? "gap-1 overflow-x-auto scrollbar-hide" : "snap-x snap-mandatory gap-0 overflow-x-auto border-b border-gray-100 scrollbar-hide"}`}
    >
      {TABS.map((tab) => {
        const active = type === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setType(tab.key)}
            className={
              isHero
                ? `flex min-w-[72px] flex-shrink-0 flex-col items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-2 sm:min-w-[88px] sm:px-4 ${
                    active
                      ? "z-[2] border-[#ccc] border-b-white bg-white"
                      : "border-transparent bg-white/80 text-gray-600"
                  }`
                : `relative flex-shrink-0 snap-start px-3 py-2.5 text-xs font-semibold sm:px-5 sm:py-3 sm:text-sm ${
                    active
                      ? "text-[#2577be] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2577be]"
                      : "text-gray-500 hover:text-gray-700"
                  }`
            }
          >
            {isHero && (
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                  active ? "bg-[#2d83c2] text-white" : "bg-[#eaf3f9] text-[#2d83c2]"
                }`}
              >
                <Icon size={18} />
              </span>
            )}
            <span className={`text-[11px] font-medium sm:text-xs ${isHero && active ? "text-[#1a1a1a]" : ""}`}>
              {"badge" in tab && tab.badge && (
                <span className="mr-1 rounded bg-[#2dd4bf] px-1 py-0.5 text-[8px] font-bold text-[#1e2e5e]">
                  {tab.badge}
                </span>
              )}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  const searchRow = (
    <div
      className={
        isHero
          ? "flex flex-col gap-3 lg:flex-row lg:items-stretch"
          : "flex flex-col gap-2 sm:flex-row sm:items-stretch"
      }
    >
      <div
        ref={containerRef}
        className={`relative flex min-w-0 items-center gap-2 ${isHero ? "flex-[1.4] px-1 lg:px-2" : "w-full flex-1 sm:min-w-[240px]"}`}
      >
        <Image src={ASSETS.searchIcon} alt="" width={24} height={24} className="hidden shrink-0 lg:block" unoptimized />
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
          className="min-w-0 w-full bg-transparent text-sm font-medium text-[#1a1a1a] outline-none placeholder:text-gray-400"
        />
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
        <div className={`flex min-w-0 gap-2 ${isHero ? "flex-[1.2]" : "w-full sm:w-auto"}`}>
          <button
            type="button"
            onClick={() => checkInRef.current?.showPicker?.() ?? checkInRef.current?.focus()}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f2f5f9] px-3 py-2 text-left lg:bg-transparent lg:px-2"
          >
            {isHero && (
              <Image src={ASSETS.datepickerIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />
            )}
            <div>
              <div className="text-[10px] text-gray-500">Check-in</div>
              <div className="text-sm font-semibold text-[#1a1a1a]">{checkInFmt.full}</div>
              {isHero && checkInFmt.day && <div className="text-xs text-gray-500">{checkInFmt.day}</div>}
            </div>
            <input
              ref={checkInRef}
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          </button>
          <button
            type="button"
            onClick={() => checkOutRef.current?.showPicker?.() ?? checkOutRef.current?.focus()}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f2f5f9] px-3 py-2 text-left lg:bg-transparent lg:px-2"
          >
            {isHero && (
              <Image src={ASSETS.datepickerIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />
            )}
            <div>
              <div className="text-[10px] text-gray-500">Check-out</div>
              <div className="text-sm font-semibold text-[#1a1a1a]">{checkOutFmt.full}</div>
              {isHero && checkOutFmt.day && <div className="text-xs text-gray-500">{checkOutFmt.day}</div>}
            </div>
            <input
              ref={checkOutRef}
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          </button>
        </div>
      )}

      {showRooms && (
        <div ref={roomRef} className={`relative ${isHero ? "min-w-[150px]" : ""}`}>
          <button
            type="button"
            onClick={() => setRoomOpen((v) => !v)}
            className="flex h-full w-full items-center gap-2 rounded-lg bg-[#f2f5f9] px-3 py-2 text-left lg:bg-transparent lg:px-2"
          >
            {isHero && (
              <Image src={ASSETS.userIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />
            )}
            <div>
              <div className="text-sm font-semibold text-[#1a1a1a]">
                {guests} Adult{guests !== 1 ? "s" : ""} - {children} Child{children !== 1 ? "ren" : ""}
              </div>
              <div className="text-xs text-gray-500">
                {rooms} room{rooms !== 1 ? "s" : ""}
              </div>
            </div>
          </button>
          {roomOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
              {[
                { label: "Rooms", value: rooms, set: setRooms, max: 8 },
                { label: "Adults", value: guests, set: setGuests, max: 20 },
                { label: "Children", value: children, set: setChildren, max: 10 },
              ].map((row) => (
                <div key={row.label} className="mb-3 flex items-center justify-between last:mb-0">
                  <span className="text-sm text-gray-700">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 rounded border border-gray-200 text-lg leading-none"
                      onClick={() => row.set(Math.max(row.label === "Adults" ? 1 : 0, row.value - 1))}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{row.value}</span>
                    <button
                      type="button"
                      className="h-8 w-8 rounded border border-gray-200 text-lg leading-none"
                      onClick={() => row.set(Math.min(row.max, row.value + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        className={`shrink-0 rounded-lg bg-[#2577be] font-semibold uppercase tracking-wide text-white transition hover:bg-[#1e2e5e] ${
          isHero ? "min-w-[140px] px-6 py-3 lg:min-w-[168px] lg:self-center" : "w-full px-6 py-3 sm:w-auto"
        }`}
      >
        Search
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSearch} className="w-full min-w-0">
      {isHero ? (
        <div className="w-full">
          {tabRow}
          <div className="rounded-b-lg rounded-tr-lg border border-[#2d83c2] bg-white p-4 shadow-[0_3px_6px_rgba(0,0,0,0.16)] sm:p-5 lg:rounded-tl-none lg:p-6">
            {searchRow}
          </div>
        </div>
      ) : (
        <div className="w-full min-w-0 rounded-2xl bg-white p-2 shadow-xl sm:p-2.5">
          {tabRow}
          <div className="p-2 sm:p-3">{searchRow}</div>
        </div>
      )}
    </form>
  );
}
