"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, Plane } from "lucide-react";
import SearchSuggestions from "./SearchSuggestions";
import type { SearchSuggestion } from "@/lib/travala-suggest";
import { ASSETS } from "@/data/site-data";
import { defaultStayDates } from "@/lib/travala-price";
import FlightSearchForm from "./FlightSearchForm";
import { useTranslations } from "@/i18n/useTranslations";
import { searchStaysPath } from "@/lib/seo-paths";

const TABS = [
  { key: "stays", labelKey: "stays" as const, icon: Building2 },
  { key: "flights", labelKey: "flights" as const, icon: Plane },
] as const;

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
  onTypeChange,
  syncFromUrl = false,
}: {
  defaultType?: string;
  defaultQuery?: string;
  compact?: boolean;
  onTypeChange?: (type: string) => void;
  syncFromUrl?: boolean;
}) {
  const router = useRouter();
  const urlParams = useSearchParams();
  const { messages: m, fmt } = useTranslations();
  const defaults = defaultStayDates();
  const [type, setType] = useState(defaultType);
  const [query, setQuery] = useState(defaultQuery);
  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [guests, setGuests] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  useEffect(() => {
    if (!syncFromUrl) return;
    const urlQ = urlParams.get("q") || defaultQuery;
    const urlCheckIn = urlParams.get("checkIn");
    const urlCheckOut = urlParams.get("checkOut");
    const urlGuests = urlParams.get("guests");
    const urlRooms = urlParams.get("rooms");
    const urlType = urlParams.get("type");
    if (urlType) setType(urlType);
    setQuery(urlQ);
    if (urlCheckIn) setCheckIn(urlCheckIn);
    if (urlCheckOut) setCheckOut(urlCheckOut);
    if (urlGuests) setGuests(Math.max(1, parseInt(urlGuests, 10) || 2));
    if (urlRooms) setRooms(Math.max(1, parseInt(urlRooms, 10) || 1));
  }, [syncFromUrl, urlParams, defaultQuery]);
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

  const showDates = type === "stays";
  const showRooms = type === "stays";
  const isHero = !compact;
  const canSearchStays = query.trim().length > 0;

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
    const term = searchQuery.trim();
    if (type === "stays" && !term) return;

    const dateParams = new URLSearchParams();
    if (checkIn) dateParams.set("checkIn", checkIn);
    if (checkOut) dateParams.set("checkOut", checkOut);
    dateParams.set("guests", String(guests + children));
    if (showRooms) dateParams.set("rooms", String(rooms));
    setSuggestOpen(false);

    if (type === "flights") {
      const params = new URLSearchParams({ type });
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      dateParams.forEach((value, key) => params.set(key, value));
      router.push(`/search?${params.toString()}`);
      return;
    }

    const base = searchStaysPath(term);
    const qs = dateParams.toString();
    router.push(qs ? `${base}${base.includes("?") ? "&" : "?"}${qs}` : base);
  };

  const selectSuggestion = (item: SearchSuggestion) => {
    const term = item.searchQuery || item.query || item.label;
    setQuery(term);
    navigateToSearch(term);
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

  const handleTabChange = (tab: string) => {
    setType(tab);
    onTypeChange?.(tab);
  };

  if (type === "flights") {
    return (
      <FlightSearchForm
        compact={compact}
        activeTab={type}
        onTabChange={handleTabChange}
      />
    );
  }

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
            onClick={() => handleTabChange(tab.key)}
            className={
              isHero
                ? `flex min-w-[72px] flex-shrink-0 flex-col items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-2 sm:min-w-[88px] sm:px-4 ${
                    active
                      ? "z-[2] border-[#ccc] border-b-white bg-white"
                      : "border-transparent bg-white/80 text-gray-600"
                  }`
                : `relative flex-shrink-0 snap-start px-3 py-2.5 text-xs font-semibold sm:px-5 sm:py-3 sm:text-sm ${
                    active
                      ? "text-[#2D83C2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2D83C2]"
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
              {m.nav[tab.labelKey]}
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
        className={`relative z-20 flex min-h-[52px] min-w-0 items-center gap-2 overflow-visible rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-2 sm:min-h-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 ${isHero ? "flex-[1.4] lg:px-2" : "w-full flex-1 sm:min-w-[240px]"}`}
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
          placeholder={m.search.placeholders[type as keyof typeof m.search.placeholders] || m.common.whereTo}
          autoComplete="off"
          enterKeyHint="search"
          aria-autocomplete="list"
          aria-expanded={suggestOpen && (suggestions.length > 0 || suggestLoading)}
          className="min-h-[44px] min-w-0 w-full bg-transparent text-base font-medium text-[#1a1a1a] outline-none placeholder:text-gray-400 sm:min-h-0 sm:text-sm"
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
        <div className={`flex min-w-0 flex-col gap-2 sm:flex-row sm:gap-2 ${isHero ? "flex-[1.2]" : "w-full sm:w-auto"}`}>
          <label className="flex min-h-[52px] min-w-0 flex-1 flex-col justify-center rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-2 sm:hidden">
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">{m.common.checkIn}</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-1 w-full bg-transparent text-base font-semibold text-[#1a1a1a] outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => checkInRef.current?.showPicker?.() ?? checkInRef.current?.focus()}
            className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f2f5f9] px-3 py-2 text-left sm:flex lg:bg-transparent lg:px-2"
          >
            {isHero && (
              <Image src={ASSETS.datepickerIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />
            )}
            <div>
              <div className="text-[10px] text-gray-500">{m.common.checkIn}</div>
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
          <label className="flex min-h-[52px] min-w-0 flex-1 flex-col justify-center rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-2 sm:hidden">
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">{m.common.checkOut}</span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full bg-transparent text-base font-semibold text-[#1a1a1a] outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => checkOutRef.current?.showPicker?.() ?? checkOutRef.current?.focus()}
            className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f2f5f9] px-3 py-2 text-left sm:flex lg:bg-transparent lg:px-2"
          >
            {isHero && (
              <Image src={ASSETS.datepickerIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />
            )}
            <div>
              <div className="text-[10px] text-gray-500">{m.common.checkOut}</div>
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
        <div ref={roomRef} className={`relative ${isHero ? "min-w-[150px]" : "w-full sm:w-auto"}`}>
          <button
            type="button"
            onClick={() => setRoomOpen((v) => !v)}
            className="flex min-h-[52px] w-full items-center gap-2 rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-left sm:min-h-0 sm:rounded-lg sm:border-0 sm:bg-[#f2f5f9] lg:bg-transparent lg:px-2"
          >
            {isHero && (
              <Image src={ASSETS.userIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />
            )}
            <div>
              <div className="text-base font-semibold text-[#1a1a1a] sm:text-sm">
                {guests} Adult{guests !== 1 ? "s" : ""} - {children} Child{children !== 1 ? "ren" : ""}
              </div>
              <div className="text-xs text-gray-500">
                {rooms} room{rooms !== 1 ? "s" : ""}
              </div>
            </div>
          </button>
          {roomOpen && (
            <>
            <button
              type="button"
              aria-label="Close guest selector"
              className="fixed inset-0 z-40 bg-black/30 sm:hidden"
              onClick={() => setRoomOpen(false)}
            />
            <div className="fixed inset-x-4 bottom-4 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-2 sm:w-64 sm:max-h-none sm:rounded-lg">
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
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-lg leading-none sm:h-8 sm:w-8 sm:rounded"
                      onClick={() => row.set(Math.max(row.label === "Adults" ? 1 : 0, row.value - 1))}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{row.value}</span>
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-lg leading-none sm:h-8 sm:w-8 sm:rounded"
                      onClick={() => row.set(Math.min(row.max, row.value + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            <button
              type="button"
              onClick={() => setRoomOpen(false)}
              className="mt-4 w-full rounded-xl bg-[#2D83C2] py-3 text-sm font-semibold text-white sm:hidden"
            >
              Done
            </button>
            </div>
            </>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSearchStays}
        className={`shrink-0 rounded-xl font-semibold uppercase tracking-wide text-white transition ${
          canSearchStays
            ? "bg-[#2D83C2] hover:bg-[#1a5f94]"
            : "cursor-not-allowed bg-[#2D83C2]/40"
        } ${
          isHero ? "min-h-12 min-w-[140px] px-6 py-3 lg:min-w-[168px] lg:self-center" : "min-h-12 w-full px-6 py-3.5 sm:w-auto"
        }`}
      >
        {m.common.search}
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
