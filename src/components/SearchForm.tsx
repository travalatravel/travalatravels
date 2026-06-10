"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import SearchSuggestions from "./SearchSuggestions";
import MobileSearchOverlay from "./MobileSearchOverlay";
import type { SearchSuggestion } from "@/lib/travala-suggest";
import { ASSETS } from "@/data/site-data";
import { defaultStayDates } from "@/lib/travala-price";
import FlightSearchForm from "./FlightSearchForm";
import { useTranslations } from "@/i18n/useTranslations";
import { LOCALE_BCP47 } from "@/i18n/config";
import { searchStaysPath } from "@/lib/seo-paths";
import {
  formatDesktopDate,
  MobileDateRange,
  MobileSearchCard,
  MobileSearchIcon,
  MobileUserIcon,
  DesktopDateButton,
  SearchFormPanel,
  SearchFormShell,
  SearchFormTabs,
  SearchSubmitButton,
} from "./search-form-ui";

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
  const { locale, messages: m, fmt } = useTranslations();
  const dateLocale = LOCALE_BCP47[locale];
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
  const [mobileOverlayOpen, setMobileOverlayOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
    if (!suggestOpen && !mobileOverlayOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void fetchSuggestions(query, type), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, type, suggestOpen, mobileOverlayOpen, fetchSuggestions]);

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
    dateParams.set("rooms", String(rooms));
    setSuggestOpen(false);
    setMobileOverlayOpen(false);

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

  const checkInFmt = formatDesktopDate(checkIn, m.common.selectDate, dateLocale);
  const checkOutFmt = formatDesktopDate(checkOut, m.common.selectDate, dateLocale);

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

  const roomsLabel = (n: number) => (n === 1 ? m.common.room : m.common.rooms);
  const adultsLabel = (n: number) => (n === 1 ? m.common.adult : m.common.adults);
  const childrenLabel = (n: number) => (n === 1 ? m.common.child : m.common.children);

  const guestRows = [
    { key: "rooms" as const, label: m.common.rooms, value: rooms, set: setRooms, min: 1, max: 8 },
    { key: "adults" as const, label: m.common.adults, value: guests, set: setGuests, min: 1, max: 20 },
    { key: "children" as const, label: m.common.children, value: children, set: setChildren, min: 0, max: 10 },
  ];

  const dateIcon = (
    <Image src={ASSETS.datepickerIcon} alt="" width={24} height={24} className="shrink-0 opacity-70" unoptimized />
  );

  const guestPicker = (
    <div ref={roomRef} className="relative w-full lg:min-w-[170px] lg:flex-1">
      <MobileSearchCard
        icon={<MobileUserIcon />}
        onClick={() => setRoomOpen((v) => !v)}
        primary={fmt(m.search.staysGuestDesktop, {
          adults: guests,
          adultsLabel: adultsLabel(guests),
          children,
          childrenLabel: childrenLabel(children),
        })}
        secondary={fmt(m.search.staysRoomsLine, { rooms, roomsLabel: roomsLabel(rooms) })}
      />
      <button
        type="button"
        onClick={() => setRoomOpen((v) => !v)}
        className="hidden min-h-0 w-full items-center gap-3 rounded-none bg-transparent px-4 py-3.5 text-left lg:flex"
      >
        <Image src={ASSETS.userIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[#1a1a1a]">
            {fmt(m.search.staysGuestDesktop, {
              adults: guests,
              adultsLabel: adultsLabel(guests),
              children,
              childrenLabel: childrenLabel(children),
            })}
          </div>
          <div className="text-xs text-gray-500">
            {fmt(m.search.staysRoomsLine, { rooms, roomsLabel: roomsLabel(rooms) })}
          </div>
        </div>
      </button>
      {roomOpen && (
        <>
          <button
            type="button"
            aria-label={m.search.closeGuestSelector}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setRoomOpen(false)}
          />
          <div className="fixed inset-x-4 bottom-4 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-xl lg:absolute lg:inset-x-auto lg:bottom-auto lg:left-0 lg:top-full lg:mt-2 lg:w-64 lg:max-h-none lg:rounded-lg">
            {guestRows.map((row) => (
              <div key={row.key} className="mb-3 flex items-center justify-between last:mb-0">
                <span className="text-sm text-gray-700">{row.label}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-lg leading-none lg:h-8 lg:w-8 lg:rounded"
                    onClick={() => row.set(Math.max(row.min, row.value - 1))}
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{row.value}</span>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-lg leading-none lg:h-8 lg:w-8 lg:rounded"
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
              className="mt-4 w-full rounded-lg bg-[#2577be] py-3 text-sm font-semibold text-white lg:hidden"
            >
              {m.common.done}
            </button>
          </div>
        </>
      )}
    </div>
  );

  const destinationField = (
    <div
      ref={containerRef}
      className={`relative z-20 min-w-0 overflow-visible ${
        isHero
          ? "w-full lg:flex-[1.35] lg:rounded-none lg:bg-transparent lg:px-4 lg:py-3.5"
          : "w-full flex-1 rounded-xl border border-gray-200 bg-[#eef3f8] px-3 py-2 sm:min-w-[240px] sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
      }`}
    >
      <MobileSearchCard
        icon={<MobileSearchIcon />}
        onClick={() => setMobileOverlayOpen(true)}
        primary={query || undefined}
        placeholder={m.search.placeholders.stays}
      />
      <div className="hidden min-h-[44px] items-center gap-3 lg:flex lg:min-h-0">
        <Image src={ASSETS.searchIcon} alt="" width={22} height={22} className="shrink-0" unoptimized />
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
          placeholder={m.search.placeholders.stays}
          autoComplete="off"
          enterKeyHint="search"
          aria-autocomplete="list"
          aria-expanded={suggestOpen && (suggestions.length > 0 || suggestLoading)}
          className="min-w-0 w-full bg-transparent text-base font-medium text-[#1a1a1a] outline-none placeholder:text-gray-400 lg:text-sm"
        />
      </div>
      {suggestOpen && (
        <div className="hidden lg:block">
          <SearchSuggestions
            suggestions={suggestions}
            loading={suggestLoading}
            query={query}
            activeIndex={activeIndex}
            onSelect={selectSuggestion}
            onHover={setActiveIndex}
          />
        </div>
      )}
    </div>
  );

  const tabRow = <SearchFormTabs activeTab={type} onTabChange={handleTabChange} isHero={isHero} />;

  const heroContent = (
    <>
      <div className="flex flex-col gap-3 p-[15px] lg:hidden">
        {destinationField}
        <MobileDateRange
          checkIn={checkIn}
          checkOut={checkOut}
          checkInLabel={m.common.checkIn}
          checkOutLabel={m.common.checkOut}
          locale={dateLocale}
          checkInFallback={m.common.selectDate}
          checkOutFallback={m.common.selectDate}
          onCheckInClick={() => checkInRef.current?.showPicker?.() ?? checkInRef.current?.focus()}
          onCheckOutClick={() => checkOutRef.current?.showPicker?.() ?? checkOutRef.current?.focus()}
          checkInInput={
            <input
              ref={checkInRef}
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          }
          checkOutInput={
            <input
              ref={checkOutRef}
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          }
        />
        {guestPicker}
        <SearchSubmitButton disabled={!canSearchStays} isHero={isHero} />
      </div>

      <div className="hidden lg:flex lg:items-stretch">
        <div className="flex min-w-0 flex-[1.35] items-center border-r border-gray-200">{destinationField}</div>
        <DesktopDateButton
          label={m.common.checkIn}
          full={checkInFmt.full}
          day={checkInFmt.day}
          onClick={() => checkInRef.current?.showPicker?.() ?? checkInRef.current?.focus()}
          icon={dateIcon}
          input={
            <input
              ref={checkInRef}
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          }
        />
        <DesktopDateButton
          label={m.common.checkOut}
          full={checkOutFmt.full}
          day={checkOutFmt.day}
          onClick={() => checkOutRef.current?.showPicker?.() ?? checkOutRef.current?.focus()}
          icon={dateIcon}
          input={
            <input
              ref={checkOutRef}
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          }
        />
        <div className="flex min-w-[170px] flex-1 items-stretch border-r border-gray-200">{guestPicker}</div>
        <SearchSubmitButton disabled={!canSearchStays} isHero={isHero} />
      </div>
    </>
  );

  const compactContent = (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch lg:flex-nowrap">
      {destinationField}
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-2">
        <label className="flex min-h-[52px] min-w-0 flex-1 flex-col justify-center rounded-xl border border-gray-200 bg-[#eef3f8] px-3 py-2 sm:hidden">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">{m.common.checkIn}</span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 w-full bg-transparent text-base font-semibold text-[#1a1a1a] outline-none"
          />
        </label>
        <DesktopDateButton
          label={m.common.checkIn}
          full={checkInFmt.full}
          day={checkInFmt.day}
          onClick={() => checkInRef.current?.showPicker?.() ?? checkInRef.current?.focus()}
          icon={dateIcon}
          input={
            <input
              ref={checkInRef}
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          }
        />
        <label className="flex min-h-[52px] min-w-0 flex-1 flex-col justify-center rounded-xl border border-gray-200 bg-[#eef3f8] px-3 py-2 sm:hidden">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">{m.common.checkOut}</span>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full bg-transparent text-base font-semibold text-[#1a1a1a] outline-none"
          />
        </label>
        <DesktopDateButton
          label={m.common.checkOut}
          full={checkOutFmt.full}
          day={checkOutFmt.day}
          onClick={() => checkOutRef.current?.showPicker?.() ?? checkOutRef.current?.focus()}
          icon={dateIcon}
          input={
            <input
              ref={checkOutRef}
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          }
        />
      </div>
      {guestPicker}
      <SearchSubmitButton disabled={!canSearchStays} isHero={false} />
    </div>
  );

  return (
    <form onSubmit={handleSearch} className="w-full min-w-0">
      <SearchFormShell isHero={isHero}>
        <SearchFormPanel isHero={isHero} tabRow={tabRow}>
          {isHero ? heroContent : compactContent}
        </SearchFormPanel>
      </SearchFormShell>
      <MobileSearchOverlay
        open={mobileOverlayOpen}
        title={m.search.mobileSearch.searchPlaces}
        placeholder={m.search.placeholders.stays}
        query={query}
        onQueryChange={setQuery}
        suggestions={suggestions}
        loading={suggestLoading}
        onSelect={selectSuggestion}
        onClose={() => setMobileOverlayOpen(false)}
      />
    </form>
  );
}
