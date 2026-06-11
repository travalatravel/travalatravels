"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Building2 } from "lucide-react";
import SearchSuggestions from "./SearchSuggestions";
import MobileSearchOverlay from "./MobileSearchOverlay";
import type { SearchSuggestion } from "@/lib/travala-suggest";
import { ASSETS } from "@/data/site-data";
import { buildFlightSearchQuery } from "@/lib/flight-display";
import { clearOutboundToken, clearOfferToken } from "@/lib/flight-selection-storage";
import { filterPopularAirports } from "@/data/popular-airports";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { useTranslations } from "@/i18n/useTranslations";
import { LOCALE_BCP47 } from "@/i18n/config";
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

const TRIP_KEYS: TripType[] = ["roundtrip", "oneway"];

function defaultFlightDates() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const depart = d.toISOString().slice(0, 10);
  const r = new Date(d);
  r.setDate(r.getDate() + 7);
  return { depart, return: r.toISOString().slice(0, 10) };
}

type AirportField = "from" | "to" | "leg0from" | "leg0to" | "leg1from" | "leg1to";

export default function FlightSearchForm({
  compact = false,
  activeTab = "flights",
  onTabChange,
}: {
  compact?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const router = useRouter();
  const urlParams = useSearchParams();
  const { locale, messages: m, fmt } = useTranslations();
  const dateLocale = LOCALE_BCP47[locale];
  const defaults = defaultFlightDates();
  const isHero = !compact;

  const [trip, setTrip] = useState<TripType>("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [fromSkyId, setFromSkyId] = useState("");
  const [fromEntityId, setFromEntityId] = useState("");
  const [toSkyId, setToSkyId] = useState("");
  const [toEntityId, setToEntityId] = useState("");
  const [leg2From, setLeg2From] = useState("");
  const [leg2To, setLeg2To] = useState("");
  const [depart, setDepart] = useState(defaults.depart);
  const [returnDate, setReturnDate] = useState(defaults.return);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabin, setCabin] = useState<CabinClass>("economy");
  const [addHotel, setAddHotel] = useState(false);
  const [paxOpen, setPaxOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [activeField, setActiveField] = useState<AirportField | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fieldQuery, setFieldQuery] = useState("");
  const [mobileOverlayOpen, setMobileOverlayOpen] = useState(false);

  const paxRef = useRef<HTMLDivElement>(null);
  const departRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const clearFieldSky = (field: AirportField) => {
    if (field === "from" || field === "leg0from") {
      setFromSkyId("");
      setFromEntityId("");
    } else if (field === "to" || field === "leg0to") {
      setToSkyId("");
      setToEntityId("");
    }
  };

  const setFieldValue = (
    field: AirportField,
    label: string,
    code?: string,
    sky?: { skyId?: string; entityId?: string },
  ) => {
    if (field === "from" || field === "leg0from") {
      setFrom(label);
      setFromCode(code || "");
      setFromSkyId(sky?.skyId || "");
      setFromEntityId(sky?.entityId || "");
    } else if (field === "to" || field === "leg0to") {
      setTo(label);
      setToCode(code || "");
      setToSkyId(sky?.skyId || "");
      setToEntityId(sky?.entityId || "");
    } else if (field === "leg1from") setLeg2From(label);
    else if (field === "leg1to") setLeg2To(label);
  };

  const fetchSuggestions = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions(filterPopularAirports(trimmed, 12));
      setSuggestLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSuggestLoading(true);
    try {
      const params = new URLSearchParams({
        q: trimmed,
        limit: "8",
        locale: dateLocale,
      });
      const res = await fetch(`/api/flights/suggest?${params}`, { signal: controller.signal });
      const data = (await res.json()) as { suggestions?: SearchSuggestion[] };
      setSuggestions(data.suggestions || []);
      setActiveIndex(-1);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSuggestions(filterPopularAirports(trimmed, 8));
    } finally {
      if (!controller.signal.aborted) setSuggestLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!compact) return;
    const tripParam = urlParams.get("trip") as TripType | null;
    if (tripParam) setTrip(tripParam);
    if (urlParams.get("from")) setFrom(urlParams.get("from")!);
    if (urlParams.get("to")) setTo(urlParams.get("to")!);
    if (urlParams.get("fromCode")) setFromCode(urlParams.get("fromCode")!);
    if (urlParams.get("toCode")) setToCode(urlParams.get("toCode")!);
    if (urlParams.get("depart")) setDepart(urlParams.get("depart")!);
    if (urlParams.get("return")) setReturnDate(urlParams.get("return")!);
    if (urlParams.get("adults")) setAdults(Math.max(1, parseInt(urlParams.get("adults")!, 10)));
    if (urlParams.get("children")) setChildren(Math.max(0, parseInt(urlParams.get("children")!, 10)));
    if (urlParams.get("infants")) setInfants(Math.max(0, parseInt(urlParams.get("infants")!, 10)));
    if (urlParams.get("cabin")) setCabin(urlParams.get("cabin") as CabinClass);
    if (urlParams.get("addHotel") === "1") setAddHotel(true);
  }, [compact, urlParams]);

  useEffect(() => {
    if (!activeField) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void fetchSuggestions(fieldQuery), 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fieldQuery, activeField, fetchSuggestions]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!paxRef.current?.contains(e.target as Node)) setPaxOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  const openField = (field: AirportField, current: string) => {
    setActiveField(field);
    setFieldQuery(current);
    setSuggestions(filterPopularAirports(current.trim(), 12));
    setSuggestLoading(false);
  };

  const openMobileAirport = (field: AirportField, current: string) => {
    openField(field, current);
    setMobileOverlayOpen(true);
  };

  const closeMobileOverlay = () => {
    setMobileOverlayOpen(false);
    setActiveField(null);
    setFieldQuery("");
    setSuggestions([]);
  };

  const handleFieldQueryChange = (value: string) => {
    setFieldQuery(value);
    if (activeField) clearFieldSky(activeField);
    if (!value.trim()) {
      setSuggestions(filterPopularAirports("", 12));
      setSuggestLoading(false);
    }
  };

  const selectSuggestion = (item: SearchSuggestion) => {
    if (!activeField) return;
    const code = item.iata || item.searchQuery?.slice(0, 3).toUpperCase();
    setFieldValue(activeField, item.label, code, {
      skyId: item.skyId,
      entityId: item.entityId,
    });
    setActiveField(null);
    setFieldQuery("");
    setSuggestions([]);
    setMobileOverlayOpen(false);
  };

  const cabinLabel = (c: CabinClass) => {
    const labels: Record<CabinClass, string> = {
      economy: m.search.cabin.economy,
      premium_economy: m.search.cabin.premiumEconomy,
      business: m.search.cabin.business,
      first: m.search.cabin.first,
    };
    return labels[c];
  };

  const passengerLabel = (n: number) => (n === 1 ? m.common.passenger : m.common.passengers);

  const swapAirports = () => {
    setFrom(to);
    setTo(from);
    setFromCode(toCode);
    setToCode(fromCode);
    setFromSkyId(toSkyId);
    setToSkyId(fromSkyId);
    setFromEntityId(toEntityId);
    setToEntityId(fromEntityId);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!from.trim() || !to.trim()) {
      router.push("/search?type=flights");
      return;
    }
    const params = buildFlightSearchQuery({
      trip,
      from: from.trim(),
      to: to.trim(),
      fromCode,
      toCode,
      fromSkyId: fromSkyId || undefined,
      fromEntityId: fromEntityId || undefined,
      toSkyId: toSkyId || undefined,
      toEntityId: toEntityId || undefined,
      depart,
      return: trip === "roundtrip" ? returnDate : undefined,
      adults,
      children,
      infants,
      cabin,
      addHotel,
      legs: trip === "multicity" ? [{ from, to }, { from: leg2From, to: leg2To }] : undefined,
    });
    setActiveField(null);
    clearOutboundToken();
    clearOfferToken();
    router.push(`/search?${params.toString()}`);
  };

  const selectDateLabel = m.common.selectDate;
  const departFmt = formatDesktopDate(depart, selectDateLabel, dateLocale);
  const returnFmt = formatDesktopDate(returnDate, selectDateLabel, dateLocale);
  const paxTotal = adults + children + infants;

  const airportInput = (
    field: AirportField,
    label: string,
    value: string,
    onChange: (v: string) => void,
    className = "",
  ) => (
    <div
      className={`relative z-20 min-w-0 overflow-visible lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 ${className}`}
    >
      <MobileSearchCard
        icon={<MobileSearchIcon />}
        onClick={() => openMobileAirport(field, value)}
        label={label}
        primary={value || undefined}
        placeholder={m.common.cityOrAirport}
      />
      <label className="hidden text-[10px] font-semibold uppercase tracking-wide text-gray-500 lg:block">{label}</label>
      <input
        type="text"
        value={activeField === field ? fieldQuery : value}
        onChange={(e) => {
          onChange(e.target.value);
          setFieldQuery(e.target.value);
          clearFieldSky(field);
        }}
        onFocus={() => openField(field, value)}
        placeholder={m.common.cityOrAirport}
        autoComplete="off"
        enterKeyHint="search"
        className="mt-1 hidden min-h-[44px] w-full min-w-0 bg-transparent text-base font-semibold text-[#1a1a1a] outline-none placeholder:font-normal placeholder:text-gray-400 sm:mt-0.5 sm:min-h-0 sm:text-sm lg:block"
      />
      {activeField === field && !mobileOverlayOpen && (
        <div className="hidden lg:block">
          <SearchSuggestions
            suggestions={suggestions}
            loading={suggestLoading}
            query={fieldQuery}
            activeIndex={activeIndex}
            onSelect={selectSuggestion}
            onHover={setActiveIndex}
          />
        </div>
      )}
    </div>
  );

  const tabRow = <SearchFormTabs activeTab={activeTab} onTabChange={(tab) => onTabChange?.(tab)} isHero={isHero} />;
  const dateIcon = (
    <Image src={ASSETS.datepickerIcon} alt="" width={24} height={24} className="shrink-0 opacity-70" unoptimized />
  );
  const canSearchFlights = from.trim().length > 0 && to.trim().length > 0;

  const tripRow = (
    <div className="mb-3 flex flex-wrap gap-2 border-b border-gray-100 pb-3 sm:gap-4">
      {TRIP_KEYS.map((key) => (
        <label
          key={key}
          className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            trip === key ? "bg-[#eef5fc] font-semibold text-[#2D83C2]" : "text-[#1a1a1a]"
          }`}
        >
          <input
            type="radio"
            name="trip"
            checked={trip === key}
            onChange={() => setTrip(key)}
            className="h-4 w-4 accent-[#2D83C2]"
          />
          {m.search.tripTypes[key]}
        </label>
      ))}
    </div>
  );

  const flightRow = (
    <div className={`flex flex-col gap-3 ${isHero ? "lg:flex-row lg:items-stretch lg:flex-wrap" : ""}`}>
      <div className={`relative flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-end lg:gap-2 ${isHero ? "lg:min-w-[280px]" : ""}`}>
        {airportInput("from", m.search.flyingFrom, from, setFrom, "flex-1")}
        <button
          type="button"
          onClick={swapAirports}
          aria-label={m.search.swapAirports}
          className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-[#2D83C2] hover:bg-[#eef5fc] lg:mb-0.5"
        >
          <ArrowLeftRight size={16} />
        </button>
        {airportInput("to", m.search.flyingTo, to, setTo, "flex-1")}
      </div>

      <div className={`min-w-0 ${isHero ? "w-full lg:w-auto" : "w-full"}`}>
        <MobileDateRange
          checkIn={depart}
          checkOut={returnDate}
          checkInLabel={m.common.depart}
          checkOutLabel={m.common.return}
          locale={dateLocale}
          showCheckOut={trip === "roundtrip"}
          checkInFallback={selectDateLabel}
          checkOutFallback={selectDateLabel}
          onCheckInClick={() => departRef.current?.showPicker?.() ?? departRef.current?.focus()}
          onCheckOutClick={() => returnRef.current?.showPicker?.() ?? returnRef.current?.focus()}
          checkInInput={
            <input ref={departRef} type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="sr-only" tabIndex={-1} />
          }
          checkOutInput={
            <input ref={returnRef} type="date" value={returnDate} min={depart} onChange={(e) => setReturnDate(e.target.value)} className="sr-only" tabIndex={-1} />
          }
        />
        <div className="hidden lg:flex">
          <DesktopDateButton
            label={m.common.depart}
            full={departFmt.full}
            day={departFmt.day}
            onClick={() => departRef.current?.showPicker?.() ?? departRef.current?.focus()}
            icon={dateIcon}
            input={
              <input ref={departRef} type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="sr-only" tabIndex={-1} />
            }
          />
          {trip === "roundtrip" && (
            <DesktopDateButton
              label={m.common.return}
              full={returnFmt.full}
              day={returnFmt.day}
              onClick={() => returnRef.current?.showPicker?.() ?? returnRef.current?.focus()}
              icon={dateIcon}
              input={
                <input ref={returnRef} type="date" value={returnDate} min={depart} onChange={(e) => setReturnDate(e.target.value)} className="sr-only" tabIndex={-1} />
              }
            />
          )}
        </div>
      </div>

      <div ref={paxRef} className={`relative ${isHero ? "w-full lg:min-w-[180px]" : "w-full sm:w-auto"}`}>
        <button
          type="button"
          onClick={() => setPaxOpen((v) => !v)}
          className="flex min-h-[52px] w-full items-center gap-3 rounded-xl bg-[#eef3f8] px-4 py-3 text-left lg:min-h-0 lg:rounded-none lg:bg-transparent lg:px-4 lg:py-3.5"
        >
          {isHero && <Image src={ASSETS.userIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />}
          <div>
            <div className="text-base font-semibold text-[#1a1a1a] sm:text-sm">
              {fmt(m.search.passengersCabinLine, {
                count: paxTotal,
                passengerLabel: passengerLabel(paxTotal),
                cabin: cabinLabel(cabin),
              })}
            </div>
          </div>
        </button>
        {paxOpen && (
          <>
            <button
              type="button"
              aria-label={m.search.closePassengerSelector}
              className="fixed inset-0 z-40 bg-black/30 sm:hidden"
              onClick={() => setPaxOpen(false)}
            />
            <div className="fixed inset-x-4 bottom-4 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-2 sm:w-72 sm:max-h-none sm:rounded-xl">
            {[
              { key: "adults", label: m.common.adults, sub: m.common.yrs12, value: adults, set: setAdults, min: 1, max: 9 },
              { key: "children", label: m.common.children, sub: m.common.yrs211, value: children, set: setChildren, min: 0, max: 8 },
              { key: "infants", label: m.common.infants, sub: m.common.under2, value: infants, set: setInfants, min: 0, max: 4 },
            ].map((row) => (
              <div key={row.key} className="mb-3 flex items-center justify-between last:mb-0">
                <div>
                  <div className="text-sm font-medium text-gray-800">{row.label}</div>
                  <div className="text-[10px] text-gray-400">{row.sub}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-lg sm:h-8 sm:w-8 sm:rounded sm:text-base" onClick={() => row.set(Math.max(row.min, row.value - 1))}>−</button>
                  <span className="w-8 text-center text-base sm:w-6 sm:text-sm">{row.value}</span>
                  <button type="button" className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-lg sm:h-8 sm:w-8 sm:rounded sm:text-base" onClick={() => row.set(Math.min(row.max, row.value + 1))}>+</button>
                </div>
              </div>
            ))}
            <div className="mt-4 border-t border-gray-100 pt-3">
              <label className="text-xs font-medium text-gray-500">{m.search.cabinClass}</label>
              <select
                value={cabin}
                onChange={(e) => setCabin(e.target.value as CabinClass)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-3 text-base outline-none focus:border-[#2D83C2] sm:py-2 sm:text-sm"
              >
                {(["economy", "premium_economy", "business", "first"] as CabinClass[]).map((c) => (
                  <option key={c} value={c}>{cabinLabel(c)}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setPaxOpen(false)}
              className="mt-4 w-full rounded-lg bg-[#2577be] py-3 text-sm font-semibold text-white lg:hidden"
            >
              {m.common.donePassengers}
            </button>
          </div>
          </>
        )}
      </div>

      <SearchSubmitButton disabled={!canSearchFlights} isHero={isHero} />
    </div>
  );

  const addHotelRow = (
    <label className={`flex cursor-pointer items-center gap-2 text-sm text-gray-600 ${isHero ? "px-[15px] pb-[15px] lg:mt-4 lg:px-6 lg:pb-5" : "mt-3"}`}>
      <input type="checkbox" checked={addHotel} onChange={(e) => setAddHotel(e.target.checked)} className="accent-[#2D83C2]" />
      <Building2 size={16} className="text-[#2D83C2]" />
      {m.common.addHotel}
    </label>
  );

  return (
    <form onSubmit={handleSearch} className="w-full min-w-0">
      <SearchFormShell isHero={isHero}>
        <SearchFormPanel isHero={isHero} tabRow={tabRow}>
          <div className={isHero ? "p-[15px] lg:p-5" : ""}>
            {tripRow}
            {flightRow}
          </div>
          {addHotelRow}
        </SearchFormPanel>
      </SearchFormShell>
      <MobileSearchOverlay
        open={mobileOverlayOpen}
        title={m.search.mobileSearch.searchAirport}
        placeholder={m.common.cityOrAirport}
        query={fieldQuery}
        onQueryChange={handleFieldQueryChange}
        suggestions={suggestions}
        loading={suggestLoading}
        onSelect={selectSuggestion}
        onClose={closeMobileOverlay}
        showAllAirportsBadge
      />
    </form>
  );
}
